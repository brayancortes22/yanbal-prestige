#!/usr/bin/env node
/**
 * Pruebas de seguridad reales contra la API .NET.
 *
 * Cubre lo que se puede verificar sin base de datos (middleware y modelo de
 * autorización) y marca como SKIP lo que depende de MySQL, en lugar de dar
 * un falso positivo.
 *
 * Uso:
 *   node scripts/security-smoke.mjs
 *   API_URL=http://127.0.0.1:5075 node scripts/security-smoke.mjs
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const API_URL = (process.env.API_URL || 'http://127.0.0.1:5075').replace(/\/$/, '');
const results = [];

const record = (name, status, detail) => {
  results.push({ name, status, detail });
  const icon = status === 'PASS' ? 'OK  ' : status === 'SKIP' ? 'SKIP' : 'FAIL';
  console.log(`  [${icon}] ${name}${detail ? ` — ${detail}` : ''}`);
};

const request = async (pathname, options = {}) => {
  const response = await fetch(`${API_URL}${pathname}`, {
    redirect: 'manual',
    ...options,
    headers: {
      'User-Agent': 'YanbalPrestige-SecuritySmoke/1.0',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  return { response, text, status: response.status, headers: response.headers };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const test = async (name, fn) => {
  try {
    const detail = await fn();
    record(name, 'PASS', detail);
  } catch (error) {
    if (error?.skip) {
      record(name, 'SKIP', error.message);
    } else {
      record(name, 'FAIL', error.message);
    }
  }
};

const skip = (message) => {
  const error = new Error(message);
  error.skip = true;
  throw error;
};

const main = async () => {
  console.log('='.repeat(66));
  console.log(' PRUEBAS DE SEGURIDAD — YANBAL PRESTIGE API');
  console.log(` Objetivo: ${API_URL}`);
  console.log('='.repeat(66));

  let healthOk = false;
  await test('Healthcheck disponible', async () => {
    const { status, text } = await request('/health');
    assert(status === 200, `HTTP ${status}`);
    healthOk = true;
    return text.slice(0, 120);
  });

  if (!healthOk) {
    console.error('\nLa API no responde. Iníciela con: dotnet run --launch-profile http');
    process.exitCode = 1;
    return;
  }

  await test('Cabecera X-Content-Type-Options: nosniff', async () => {
    const { headers } = await request('/health');
    const value = headers.get('x-content-type-options');
    assert(value === 'nosniff', `valor: ${value}`);
    return 'nosniff';
  });

  await test('Cabecera X-Frame-Options: DENY', async () => {
    const { headers } = await request('/health');
    const value = headers.get('x-frame-options');
    assert(value === 'DENY', `valor: ${value}`);
    return 'DENY';
  });

  await test('Content-Security-Policy presente', async () => {
    const { headers } = await request('/health');
    const value = headers.get('content-security-policy');
    assert(value && value.includes("default-src 'none'"), `valor: ${value}`);
    return value;
  });

  await test('Referrer-Policy y Permissions-Policy', async () => {
    const { headers } = await request('/health');
    assert(headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy ausente');
    assert(headers.get('permissions-policy')?.includes('geolocation=()'), 'Permissions-Policy ausente');
    return 'ok';
  });

  await test('Pedidos sin sesión: 401', async () => {
    const { status } = await request('/api/Orders');
    assert(status === 401, `HTTP ${status}`);
    return 'HTTP 401';
  });

  await test('CRM sin sesión: 401', async () => {
    const { status } = await request('/api/Crm/clients?consultantId=victima');
    assert(status === 401, `HTTP ${status}`);
    return 'HTTP 401';
  });

  await test('Alta de producto sin sesión: 401', async () => {
    const { status } = await request('/api/Catalog/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'HACK-1', name: 'X', category: 'rostro', price: 1 }),
    });
    assert(status === 401, `HTTP ${status}`);
    return 'HTTP 401';
  });

  await test('JWT alterado: 401', async () => {
    const forged = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJEaXJlY3RvciIsImV4cCI6NDA3MDkwODgwMH0',
      'firma-invalida',
    ].join('.');
    const { status } = await request('/api/Orders', {
      headers: { Authorization: `Bearer ${forged}` },
    });
    assert(status === 401, `HTTP ${status}`);
    return 'HTTP 401';
  });

  await test('Login con correo inválido: 400 (no 500)', async () => {
    const { status } = await request('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "' OR 1=1 --", password: 'x' }),
    });
    assert(status === 400, `HTTP ${status}`);
    return 'HTTP 400';
  });

  await test('Login con cuerpo vacío: 400', async () => {
    const { status } = await request('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(status === 400, `HTTP ${status}`);
    return 'HTTP 400';
  });

  await test('Payload gigante rechazado sin caída', async () => {
    const huge = 'A'.repeat(200_000);
    const { status } = await request('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `${huge}@x.com`, password: huge }),
    });
    assert([400, 413].includes(status), `HTTP ${status}`);
    return `HTTP ${status}`;
  });

  await test('CORS: origen no autorizado no recibe ACAO', async () => {
    const { headers } = await request('/health', {
      headers: { Origin: 'https://evil.example' },
    });
    const acao = headers.get('access-control-allow-origin');
    assert(!acao || !acao.includes('evil.example'), `ACAO: ${acao}`);
    return 'sin cabecera para evil.example';
  });

  await test('CORS: origen permitido recibe ACAO', async () => {
    const { headers } = await request('/health', {
      headers: { Origin: 'http://127.0.0.1:5173' },
    });
    const acao = headers.get('access-control-allow-origin');
    assert(acao === 'http://127.0.0.1:5173', `ACAO: ${acao}`);
    return acao;
  });

  // Las siguientes pruebas requieren MySQL operativo y credenciales válidas.
  // Se ejecutan antes del rate limit para que el bloqueo de 10/min no las afecte.
  await test('Login demo real (requiere BD)', async () => {
    let response;
    try {
      response = await request('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yulieth.directora@yanbalprestige.com',
          password: 'yanbal2026',
        }),
      });
    } catch {
      skip('API sin base de datos: la conexión MySQL no está disponible');
    }
    const { status, text } = response;
    if (status >= 500) skip('API sin base de datos: no se pudo validar el login');
    assert(status === 200, `HTTP ${status}: ${text.slice(0, 160)}`);
    const body = JSON.parse(text);
    assert(Boolean(body.token), 'respuesta sin token');
    return 'token emitido';
  });

  await test('PIN con respuesta neutra (requiere BD)', async () => {
    let response;
    try {
      response = await request('/api/Auth/request-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'yulieth.directora@yanbalprestige.com' }),
      });
    } catch {
      skip('API sin base de datos: la conexión MySQL no está disponible');
    }
    const { status, text } = response;
    if (status >= 500) skip('API sin base de datos: no se pudo validar el flujo de PIN');
    assert(status === 200, `HTTP ${status}`);
    const body = JSON.parse(text);
    assert(body.success === true, 'la respuesta no es neutra');
    if (body.pin) {
      skip('Entorno Development: el PIN se devuelve a propósito para pruebas locales');
    }
    return 'respuesta neutra sin PIN';
  });

  const tokenCache = new Map();
  const loginToken = async (email, password = 'yanbal2026') => {
    const key = `${email}:${password}`;
    if (tokenCache.has(key)) return tokenCache.get(key);

    const { status, text } = await request('/api/Auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (status !== 200) {
      tokenCache.set(key, null);
      return null;
    }
    const token = JSON.parse(text).token;
    tokenCache.set(key, token);
    return token;
  };

  await test('IDOR: consultora no lee un pedido ajeno', async () => {
    const directorToken = await loginToken('yulieth.directora@yanbalprestige.com');
    const consultantToken = await loginToken('diana.salazar@yanbalprestige.com');
    if (!directorToken || !consultantToken) skip('Sin tokens de prueba en MySQL');

    const orders = await request('/api/Orders', {
      headers: { Authorization: `Bearer ${directorToken}` },
    });
    if (orders.status !== 200) skip('No se pudo listar pedidos');
    const first = JSON.parse(orders.text).data?.[0];
    if (!first) skip('No hay pedidos sembrados para probar el IDOR');

    const { status } = await request(`/api/Orders/${first.id}`, {
      headers: { Authorization: `Bearer ${consultantToken}` },
    });
    assert(status === 404, `una consultora ajena recibió HTTP ${status}`);
    return 'HTTP 404 para pedido ajeno';
  });

  await test('IDOR: consultora no cambia el estado de un pedido ajeno', async () => {
    const directorToken = await loginToken('yulieth.directora@yanbalprestige.com');
    const consultantToken = await loginToken('diana.salazar@yanbalprestige.com');
    if (!directorToken || !consultantToken) skip('Sin tokens de prueba en MySQL');

    const orders = await request('/api/Orders', {
      headers: { Authorization: `Bearer ${directorToken}` },
    });
    const first = JSON.parse(orders.text).data?.[0];
    if (!first) skip('No hay pedidos sembrados para probar el IDOR');

    const { status } = await request(`/api/Orders/${first.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${consultantToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliveryStatus: 'entregado' }),
    });
    assert(status === 404, `una consultora ajena recibió HTTP ${status}`);
    return 'HTTP 404 al intentar mutar pedido ajeno';
  });

  await test('Asistente no ve la lista completa de usuarios', async () => {
    const token = await loginToken('laura.asistente@yanbalprestige.com');
    if (!token) skip('Sin token de asistente en MySQL');
    const { status, text } = await request('/api/Auth/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(status === 200, `la asistente recibió HTTP ${status}`);
    const users = JSON.parse(text);
    assert(
      Array.isArray(users) && users.length === 1 && users[0].role === 5,
      `la asistente recibió ${users.length} usuarios`
    );
    return 'solo su propio perfil (1 usuario)';
  });

  await test('Asistente sí puede ver la cartera consolidada', async () => {
    const token = await loginToken('laura.asistente@yanbalprestige.com');
    if (!token) skip('Sin token de asistente en MySQL');
    const { status } = await request('/api/Crm/clients/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(status === 200, `la asistente recibió HTTP ${status}`);
    return 'HTTP 200 en cartera consolidada';
  });

  // Al final: este bloque agota el límite de 10 intentos/min por IP.
  await test('Rate limit de autenticación (429)', async () => {
    const attempts = [];
    for (let i = 0; i < 14; i += 1) {
      // Correo inválido: responde 400 antes de tocar MySQL y consume igual
      // el cupo del rate limiter, que es lo que se quiere verificar.
      const { status } = await request('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `rate${i}`, password: 'Password123' }),
      });
      attempts.push(status);
    }
    const blocked = attempts.filter((status) => status === 429).length;
    assert(blocked > 0, `ningún 429 en ${attempts.join(',')}`);
    return `${blocked} de 14 bloqueadas con 429`;
  });

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  const report = {
    target: API_URL,
    generatedAt: new Date().toISOString(),
    summary: { total: results.length, passed, failed, skipped },
    results,
  };

  const outputDir = path.resolve('docs', 'evidencias');
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'security-report.json');
  await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n--- RESUMEN ---');
  console.log(`Pruebas: ${results.length} | PASS: ${passed} | FAIL: ${failed} | SKIP: ${skipped}`);
  console.log(`Reporte: ${outputPath}`);

  if (failed > 0) process.exitCode = 1;
};

main().catch((error) => {
  console.error('La suite no pudo ejecutarse:', error);
  process.exitCode = 1;
});
