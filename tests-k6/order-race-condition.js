import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from './config.js';

export const options = {
  scenarios: {
    // Escenario 1: Simulación concurrente de órdenes simultáneas
    concurrent_orders: {
      executor: 'per-vu-iterations',
      vus: 15,
      iterations: 2,
      maxDuration: '20s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'], // Permitir solo fallos esperados
    http_req_duration: ['p(95)<400'], // Pedidos en menos de 400ms
  },
};

function buildOrderPayload(vuId, iter, customProps = {}) {
  return JSON.stringify({
    clientName: `Client VU ${vuId} iter ${iter}`,
    clientPhone: `30012345${(vuId % 90 + 10)}`,
    clientCity: 'Bogota D.C.',
    clientAddress: `Calle ${vuId} # ${iter}-10`,
    clientEmail: `cliente.vu${vuId}@yanbalprestige.com`,
    consultantId: CONFIG.defaultConsultant.id,
    consultantName: CONFIG.defaultConsultant.name,
    acceptedHabeasData: true,
    source: 'web_catalogo',
    items: [
      {
        productId: CONFIG.products.primary.productId,
        productSku: CONFIG.products.primary.productSku,
        productName: CONFIG.products.primary.productName,
        unitPrice: CONFIG.products.primary.unitPrice,
        quantity: 1,
      },
    ],
    ...customProps,
  });
}

export default function () {
  const vuId = __VU;
  const iter = __ITER;

  // 1. Prueba de Idempotencia (Simulación de Doble Clic del Usuario)
  const sharedKey = `idemp-key-vu${vuId}-iter${iter}`;
  const payloadIdemp = buildOrderPayload(vuId, iter, { idempotencyKey: sharedKey });

  const res1 = http.post(`${CONFIG.baseUrl}/api/orders`, payloadIdemp, {
    headers: { ...CONFIG.headers, 'X-Idempotency-Key': sharedKey },
    tags: { name: 'order_create' },
  });

  const ok1 = check(res1, {
    'orden inicial creada con 200': (r) => r.status === 200,
    'orden tiene número de factura': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.invoiceNumber && body.invoiceNumber.startsWith('FAC-');
      } catch {
        return false;
      }
    },
  });

  let firstInvoice = '';
  try {
    firstInvoice = JSON.parse(res1.body).invoiceNumber;
  } catch {}

  // Segundo clic inmediato con la misma clave de idempotencia
  const res2 = http.post(`${CONFIG.baseUrl}/api/orders`, payloadIdemp, {
    headers: { ...CONFIG.headers, 'X-Idempotency-Key': sharedKey },
    tags: { name: 'order_idempotency_check' },
  });

  check(res2, {
    'doble clic idempotente retorna 200': (r) => r.status === 200,
    'doble clic devuelve la MISMA factura (sin duplicados)': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.invoiceNumber === firstInvoice;
      } catch {
        return false;
      }
    },
  });

  // 2. Prueba Anti-Bot Honeypot (Campo trampa invisible)
  const botPayload = buildOrderPayload(vuId, iter, { trapField: 'i_am_a_malicious_bot' });
  const resBot = http.post(`${CONFIG.baseUrl}/api/orders`, botPayload, {
    headers: CONFIG.headers,
    tags: { name: 'bot_honeypot_check' },
    responseCallback: http.expectedStatuses(400),
  });

  check(resBot, {
    'honeypot bloquea al bot con 400': (r) => r.status === 400,
  });

  // 3. Prueba Cumplimiento Legal (Habeas Data rechazado)
  const noHabeasPayload = buildOrderPayload(vuId, iter, { acceptedHabeasData: false });
  const resNoHabeas = http.post(`${CONFIG.baseUrl}/api/orders`, noHabeasPayload, {
    headers: CONFIG.headers,
    tags: { name: 'habeas_data_check' },
    responseCallback: http.expectedStatuses(400),
  });

  check(resNoHabeas, {
    'rechaza pedido sin Habeas Data con 400': (r) => r.status === 400,
  });

  sleep(0.3);
}
