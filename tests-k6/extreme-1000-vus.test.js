import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from './config.js';

export const options = {
  scenarios: {
    // 1. Clientes públicos (700 VUs): Navegan catálogo y compran
    public_shoppers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 200 },
        { duration: '15s', target: 700 },
        { duration: '20s', target: 700 },
        { duration: '7s', target: 0 },
      ],
      exec: 'shopperScenario',
    },
    // 2. Consultoras en terreno (150 VUs): Login JWT, cartera y pedidos
    consultants: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 50 },
        { duration: '15s', target: 150 },
        { duration: '20s', target: 150 },
        { duration: '7s', target: 0 },
      ],
      exec: 'consultantScenario',
    },
    // 3. Dirección y Supervisión (50 VUs): Login JWT, métricas y leads
    directors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 20 },
        { duration: '15s', target: 50 },
        { duration: '20s', target: 50 },
        { duration: '7s', target: 0 },
      ],
      exec: 'directorScenario',
    },
    // 4. Bots maliciosos (100 VUs): Inyección Honeypot y sin consentimiento
    malicious_bots: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '8s', target: 30 },
        { duration: '15s', target: 100 },
        { duration: '20s', target: 100 },
        { duration: '7s', target: 0 },
      ],
      exec: 'botScenario',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],       // Tasa de fallos menor al 2% bajo 1000 VUs
    http_req_duration: ['p(95)<300'],     // 95% de peticiones bajo 300ms
  },
};

// 1. Flujo de Cliente Público
export function shopperScenario() {
  const vuId = __VU;
  const iter = __ITER;

  // Catálogo público en RAM
  const resCat = http.get(`${CONFIG.baseUrl}/api/catalog/products`, { headers: CONFIG.headers });
  check(resCat, { 'catálogo 200 OK': (r) => r.status === 200 });

  // Detalle de producto
  const resDetail = http.get(`${CONFIG.baseUrl}/api/catalog/products/${CONFIG.products.primary.productId}`, { headers: CONFIG.headers });
  check(resDetail, { 'detalle 200 OK': (r) => r.status === 200 });

  // Creación de pedido con idempotencia
  const idempKey = `extreme-shopper-vu${vuId}-${iter}-${Date.now()}`;
  const payload = JSON.stringify({
    clientName: `Cliente Extremo ${vuId}-${iter}`,
    clientPhone: `300${String(1000000 + (vuId * 10 + iter)).slice(0, 7)}`,
    clientCity: 'Bogotá',
    clientAddress: `Carrera ${vuId % 100} # ${iter}-20`,
    clientEmail: `comprador${vuId}@yanbalprestige.com`,
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

  const resOrder = http.post(`${CONFIG.baseUrl}/api/orders`, payload, {
    headers: { ...CONFIG.headers, 'X-Idempotency-Key': idempKey },
  });

  check(resOrder, {
    'pedido cliente 200 OK': (r) => r.status === 200,
    'factura correlativa asignada': (r) => {
      try {
        return JSON.parse(r.body).invoiceNumber?.startsWith('FAC-');
      } catch {
        return false;
      }
    },
  });

  sleep(0.5);
}

// 2. Flujo de Consultora
export function consultantScenario() {
  const authPayload = JSON.stringify({
    email: 'carolina.mejia@yanbalprestige.com',
    password: 'yanbal2026',
  });

  const resAuth = http.post(`${CONFIG.baseUrl}/api/auth/login`, authPayload, { headers: CONFIG.headers });
  const okAuth = check(resAuth, { 'login consultora 200 OK': (r) => r.status === 200 });

  if (okAuth) {
    let token = '';
    try { token = JSON.parse(resAuth.body).token; } catch {}
    const authHeaders = { ...CONFIG.headers, Authorization: `Bearer ${token}` };

    const resClients = http.get(`${CONFIG.baseUrl}/api/crm/clients`, { headers: authHeaders });
    check(resClients, { 'cartera clientes 200 OK': (r) => r.status === 200 });

    const resOrders = http.get(`${CONFIG.baseUrl}/api/orders?pageSize=10`, { headers: authHeaders });
    check(resOrders, { 'pedidos consultora 200 OK': (r) => r.status === 200 });
  }

  sleep(0.8);
}

// 3. Flujo de Dirección / Administración
export function directorScenario() {
  const authPayload = JSON.stringify({
    email: 'yulieth.directora@yanbalprestige.com',
    password: 'yanbal2026',
  });

  const resAuth = http.post(`${CONFIG.baseUrl}/api/auth/login`, authPayload, { headers: CONFIG.headers });
  const okAuth = check(resAuth, { 'login directora 200 OK': (r) => r.status === 200 });

  if (okAuth) {
    let token = '';
    try { token = JSON.parse(resAuth.body).token; } catch {}
    const authHeaders = { ...CONFIG.headers, Authorization: `Bearer ${token}` };

    const resAllOrders = http.get(`${CONFIG.baseUrl}/api/orders?pageSize=25`, { headers: authHeaders });
    check(resAllOrders, { 'listado maestro pedidos 200 OK': (r) => r.status === 200 });

    const resLeads = http.get(`${CONFIG.baseUrl}/api/leads`, { headers: authHeaders });
    check(resLeads, { 'prospectos leads 200 OK': (r) => r.status === 200 });
  }

  sleep(1.0);
}

// 4. Flujo de Bots y Solicitudes Ilegítimas
export function botScenario() {
  const vuId = __VU;

  // Ataque Honeypot
  const botPayload = JSON.stringify({
    clientName: `Bot ${vuId}`,
    clientPhone: '3009998877',
    clientCity: 'Bogotá',
    consultantId: CONFIG.defaultConsultant.id,
    consultantName: CONFIG.defaultConsultant.name,
    trapField: 'spam_crawler_active',
    acceptedHabeasData: true,
    items: [{ productId: CONFIG.products.primary.productId, productSku: CONFIG.products.primary.productSku, productName: 'Test', unitPrice: 168000, quantity: 1 }],
  });

  const resBot = http.post(`${CONFIG.baseUrl}/api/orders`, botPayload, {
    headers: CONFIG.headers,
    responseCallback: http.expectedStatuses(400),
  });
  check(resBot, { 'honeypot mitigado con 400': (r) => r.status === 400 });

  sleep(0.5);
}
