import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from './config.js';

export const options = {
  stages: [
    { duration: '5s', target: 5 },   // Rampa a 5 usuarios concurrentes
    { duration: '15s', target: 15 }, // 15 usuarios concurrentes navegando
    { duration: '5s', target: 0 },   // Rampa de salida
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],         // Cero errores de servidor
    http_req_duration: ['p(95)<100'],       // 95% de peticiones en menos de 100ms
  },
};

export default function () {
  // 1. Consulta del catálogo completo con OutputCache
  const resCatalog = http.get(`${CONFIG.baseUrl}/api/catalog/products`, {
    headers: CONFIG.headers,
    tags: { type: 'catalog' },
  });

  check(resCatalog, {
    'catálogo responde 200 OK': (r) => r.status === 200,
    'catálogo contiene productos': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch {
        return false;
      }
    },
  });

  // 2. Consulta de detalle de producto
  const resDetail = http.get(
    `${CONFIG.baseUrl}/api/catalog/products/${CONFIG.products.primary.productId}`,
    { headers: CONFIG.headers, tags: { type: 'catalog' } }
  );

  check(resDetail, {
    'detalle producto responde 200 OK': (r) => r.status === 200,
    'detalle tiene SKU correcto': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.code === CONFIG.products.primary.productSku;
      } catch {
        return false;
      }
    },
  });

  // 3. Consulta de slides CMS
  const resSlides = http.get(`${CONFIG.baseUrl}/api/cms/slides`, {
    headers: CONFIG.headers,
    tags: { type: 'cms' },
  });

  check(resSlides, {
    'slides CMS responde 200 OK': (r) => r.status === 200,
  });

  sleep(1.2);
}
