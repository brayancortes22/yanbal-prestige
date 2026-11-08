import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from './config.js';

export const options = {
  scenarios: {
    // 1. Clientes Públicos (600 VUs)
    public_shoppers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 200 },
        { duration: '12s', target: 600 },
        { duration: '15s', target: 600 },
        { duration: '5s', target: 0 },
      ],
      exec: 'shopperScenario',
    },
    // 2. Consultoras de Belleza (200 VUs)
    consultants: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 50 },
        { duration: '12s', target: 200 },
        { duration: '15s', target: 200 },
        { duration: '5s', target: 0 },
      ],
      exec: 'consultantScenario',
    },
    // 3. Dirección y Supervisión (100 VUs)
    directors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 30 },
        { duration: '12s', target: 100 },
        { duration: '15s', target: 100 },
        { duration: '5s', target: 0 },
      ],
      exec: 'directorScenario',
    },
    // 4. Bots y Auditoría de Seguridad (100 VUs)
    security_bots: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 30 },
        { duration: '12s', target: 100 },
        { duration: '15s', target: 100 },
        { duration: '5s', target: 0 },
      ],
      exec: 'securityBotScenario',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.03'],   // Menos del 3% de errores en pico de 1000 VUs
    http_req_duration: ['p(95)<400'], // p95 menor a 400ms
  },
};

// 1. ESCENARIO CLIENTES PÚBLICOS (Catálogo, CMS, Tips, Leads, Checkout)
export function shopperScenario() {
  const vu = __VU;
  const iter = __ITER;

  // Catálogo, Slides, Videos, Eventos, Tips
  http.get(`${CONFIG.baseUrl}/api/catalog/products`, { headers: CONFIG.headers });
  http.get(`${CONFIG.baseUrl}/api/catalog/products/${CONFIG.products.primary.productId}`, { headers: CONFIG.headers });
  http.get(`${CONFIG.baseUrl}/api/cms/slides`, { headers: CONFIG.headers });
  http.get(`${CONFIG.baseUrl}/api/cms/catalog`, { headers: CONFIG.headers });
  http.get(`${CONFIG.baseUrl}/api/cms/videos`, { headers: CONFIG.headers });
  http.get(`${CONFIG.baseUrl}/api/cms/events`, { headers: CONFIG.headers });
  http.get(`${CONFIG.baseUrl}/api/tips`, { headers: CONFIG.headers });

  // Registro de prospecto "Trabaja con nosotros"
  const leadPayload = JSON.stringify({
    fullName: `Prospecto VU ${vu}-${iter}`,
    phone: `310${String(1000000 + (vu * 10 + iter)).slice(0, 7)}`,
    email: `prospecto${vu}@yanbalprestige.com`,
    city: 'Bogotá',
    experience: 'Ventas de belleza y cosmética',
  });
  http.post(`${CONFIG.baseUrl}/api/leads/join`, leadPayload, { headers: CONFIG.headers });

  // Creación de Orden de Compra
  const idempKey = `extreme-order-${vu}-${iter}-${Date.now()}`;
  const orderPayload = JSON.stringify({
    clientName: `Cliente Final ${vu}-${iter}`,
    clientPhone: `300${String(1000000 + (vu * 10 + iter)).slice(0, 7)}`,
    clientCity: 'Bogotá',
    clientAddress: `Calle ${vu % 100} # ${iter}-12`,
    clientEmail: `cliente${vu}@yanbalprestige.com`,
    consultantId: CONFIG.defaultConsultant.id,
    consultantName: CONFIG.defaultConsultant.name,
    acceptedHabeasData: true,
    source: 'web_catalogo',
    idempotencyKey: idempKey,
    items: [
      {
        productId: CONFIG.products.primary.productId,
        productSku: CONFIG.products.primary.productSku,
        productName: CONFIG.products.primary.productName,
        unitPrice: CONFIG.products.primary.unitPrice,
        quantity: 1,
      },
    ],
  });

  const resOrder = http.post(`${CONFIG.baseUrl}/api/orders`, orderPayload, {
    headers: { ...CONFIG.headers, 'X-Idempotency-Key': idempKey },
  });
  check(resOrder, { 'pedido público creado 200': (r) => r.status === 200 });

  sleep(0.5);
}

// 2. ESCENARIO CONSULTORAS (Login JWT, Perfil, Cartera CRM, Pedidos)
export function consultantScenario() {
  const vu = __VU;
  const iter = __ITER;

  const authRes = http.post(`${CONFIG.baseUrl}/api/auth/login`, JSON.stringify({
    email: 'carolina.mejia@yanbalprestige.com',
    password: 'yanbal2026',
  }), { headers: CONFIG.headers });

  if (authRes.status === 200) {
    const token = JSON.parse(authRes.body).token;
    const authHeaders = { ...CONFIG.headers, Authorization: `Bearer ${token}` };

    http.get(`${CONFIG.baseUrl}/api/auth/me`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/crm/clients`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/orders?pageSize=15`, { headers: authHeaders });

    // Registro de cliente nuevo en CRM
    const newClientPayload = JSON.stringify({
      fullName: `Clienta CRM ${vu}-${iter}`,
      phone: `320${String(1000000 + (vu * 10 + iter)).slice(0, 7)}`,
      city: 'Medellín',
      email: `clienta${vu}@yanbalprestige.com`,
    });
    http.post(`${CONFIG.baseUrl}/api/crm/clients`, newClientPayload, { headers: authHeaders });
  }

  sleep(0.8);
}

// 3. ESCENARIO DIRECTORA (Dashboard, Auditoría, Gestión de Red, Ventas Globales)
export function directorScenario() {
  const authRes = http.post(`${CONFIG.baseUrl}/api/auth/login`, JSON.stringify({
    email: 'yulieth.directora@yanbalprestige.com',
    password: 'yanbal2026',
  }), { headers: CONFIG.headers });

  if (authRes.status === 200) {
    const token = JSON.parse(authRes.body).token;
    const authHeaders = { ...CONFIG.headers, Authorization: `Bearer ${token}` };

    http.get(`${CONFIG.baseUrl}/api/auth/me`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/auth/users`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/crm/clients/all`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/orders?pageSize=50`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/leads`, { headers: authHeaders });
    http.get(`${CONFIG.baseUrl}/api/tips/admin`, { headers: authHeaders });
  }

  sleep(1.0);
}

// 4. ESCENARIO DE SEGURIDAD (Bots, Honeypot, Habeas Data, Intrusión)
export function securityBotScenario() {
  const vu = __VU;

  // Ataque Honeypot en Pedido
  const botOrder = JSON.stringify({
    clientName: `Bot ${vu}`,
    clientPhone: '3000000000',
    clientCity: 'Bogota',
    consultantId: CONFIG.defaultConsultant.id,
    consultantName: CONFIG.defaultConsultant.name,
    trapField: 'malicious_bot_token',
    acceptedHabeasData: true,
    items: [{ productId: CONFIG.products.primary.productId, productSku: CONFIG.products.primary.productSku, productName: 'Test', unitPrice: 168000, quantity: 1 }],
  });
  const resBotOrder = http.post(`${CONFIG.baseUrl}/api/orders`, botOrder, {
    headers: CONFIG.headers,
    responseCallback: http.expectedStatuses(400),
  });
  check(resBotOrder, { 'bot pedido bloqueado 400': (r) => r.status === 400 });

  // Intento de Login con contraseña incorrecta (Fuerza Bruta)
  const bruteForce = JSON.stringify({ email: 'admin@yanbalprestige.com', password: 'wrong_password_123' });
  const resBrute = http.post(`${CONFIG.baseUrl}/api/auth/login`, bruteForce, {
    headers: CONFIG.headers,
    responseCallback: http.expectedStatuses(401),
  });
  check(resBrute, { 'fuerza bruta bloqueada 401': (r) => r.status === 401 });

  sleep(0.5);
}
