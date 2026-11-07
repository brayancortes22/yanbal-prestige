#!/usr/bin/env node
/**
 * Prueba de carga real contra el frontend compilado.
 *
 * Simula 1.000 sesiones de usuario (por defecto) navegando el sitio público:
 * home -> catálogo -> ficha de producto -> tips. Cada sesión descarga también
 * el bundle JS y el CSS reales, de modo que la medición incluye payload.
 *
 * Uso:
 *   node scripts/load-test.mjs
 *   BASE_URL=http://127.0.0.1:4173 USERS=1000 CONCURRENCY=100 node scripts/load-test.mjs
 *
 * Requisito: servir `frontend/dist` (por ejemplo `npm run preview -- --port 4173`).
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import path from 'node:path';

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const USERS = Number(process.env.USERS || 1000);
const CONCURRENCY = Number(process.env.CONCURRENCY || 100);
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 15000);
// Umbral local para un `vite preview` de un solo proceso en un portátil.
// En producción (CDN/Vercel) el p95 esperado es mucho menor.
const MAX_P95_MS = Number(process.env.MAX_P95_MS || 3000);

const ROUTES = ['/', '/catalogo', '/producto/extracto-divino', '/tips'];

const percentile = (sorted, p) => {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
};

const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'YanbalPrestige-LoadTest/1.0' },
    });
    const body = await response.arrayBuffer();
    return {
      ok: response.ok,
      status: response.status,
      ms: performance.now() - started,
      bytes: body.byteLength,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      ms: performance.now() - started,
      bytes: 0,
      error: error.name === 'AbortError' ? 'timeout' : String(error.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
};

const discoverAssets = async () => {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) throw new Error(`No se pudo cargar ${BASE_URL}/ (HTTP ${response.status})`);
  const html = await response.text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
  return [...new Set(assets)];
};

const main = async () => {
  console.log('='.repeat(66));
  console.log(' PRUEBA DE CARGA — YANBAL PRESTIGE');
  console.log(` Objetivo: ${BASE_URL}`);
  console.log(` Sesiones: ${USERS} | Concurrencia: ${CONCURRENCY}`);
  console.log('='.repeat(66));

  const assets = await discoverAssets();
  console.log(`Assets descubiertos: ${assets.length} (${assets.join(', ')})`);

  const latencies = [];
  const statuses = new Map();
  const errors = [];
  let bytes = 0;
  let completed = 0;
  const start = performance.now();

  const runUser = async () => {
    const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
    const requests = [
      `${BASE_URL}${route}`,
      `${BASE_URL}${ROUTES[Math.floor(Math.random() * ROUTES.length)]}`,
      ...assets.map((asset) => `${BASE_URL}${asset}`),
    ];

    for (const url of requests) {
      const result = await fetchWithTimeout(url);
      latencies.push(result.ms);
      bytes += result.bytes;
      statuses.set(result.status, (statuses.get(result.status) || 0) + 1);
      if (!result.ok) {
        errors.push({ url, status: result.status, error: result.error || null });
      }
    }

    completed += 1;
    if (completed % 100 === 0) {
      process.stdout.write(`  ${completed}/${USERS} sesiones completadas\n`);
    }
  };

  for (let i = 0; i < USERS; i += CONCURRENCY) {
    const batch = Array.from({ length: Math.min(CONCURRENCY, USERS - i) }, () => runUser());
    await Promise.all(batch);
  }

  const elapsedMs = performance.now() - start;
  const sorted = [...latencies].sort((a, b) => a - b);
  const totalRequests = latencies.length;
  const failed = errors.length;
  const report = {
    target: BASE_URL,
    sessions: USERS,
    concurrency: CONCURRENCY,
    totalRequests,
    failedRequests: failed,
    errorRatePct: Number(((failed / Math.max(totalRequests, 1)) * 100).toFixed(2)),
    elapsedMs: Math.round(elapsedMs),
    requestsPerSecond: Number((totalRequests / (elapsedMs / 1000)).toFixed(1)),
    latencyMs: {
      min: Math.round(sorted[0] || 0),
      p50: Math.round(percentile(sorted, 50)),
      p95: Math.round(percentile(sorted, 95)),
      p99: Math.round(percentile(sorted, 99)),
      max: Math.round(sorted[sorted.length - 1] || 0),
    },
    megabytesTransferred: Number((bytes / (1024 * 1024)).toFixed(2)),
    statuses: Object.fromEntries([...statuses.entries()].sort((a, b) => a[0] - b[0])),
    sampleErrors: errors.slice(0, 10),
    generatedAt: new Date().toISOString(),
  };

  console.log('\n--- RESULTADO ---');
  console.log(JSON.stringify(report, null, 2));

  const outputDir = path.resolve('docs', 'evidencias');
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'load-test-report.json');
  await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReporte guardado en: ${outputPath}`);

  // Criterios de aceptación para un entorno local de referencia.
  if (failed > 0) {
    console.error(`\nFALLO: ${failed} peticiones no respondieron 2xx.`);
    process.exitCode = 1;
  } else if (report.latencyMs.p95 > MAX_P95_MS) {
    console.error(`\nFALLO: p95 ${report.latencyMs.p95} ms supera el umbral de ${MAX_P95_MS} ms.`);
    process.exitCode = 1;
  } else {
    console.log(`\nOK: 0 errores y p95 dentro del umbral de ${MAX_P95_MS} ms.`);
  }
};

main().catch((error) => {
  console.error('La prueba de carga no pudo ejecutarse:', error);
  process.exitCode = 1;
});
