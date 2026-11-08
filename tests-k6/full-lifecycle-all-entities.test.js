import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { CONFIG } from './config.js';

export const options = {
  scenarios: {
    // 1. Clientes públicos postulando y comprando
    shoppers_and_leads: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 20 },
        { duration: '15s', target: 50 },
        { duration: '5s', target: 0 },
      ],
      exec: 'shopperScenario',
    },
    // 2. Consultoras gestionando pedidos y cobros
    consultant_operations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 10 },
        { duration: '15s', target: 25 },
        { duration: '5s', target: 0 },
      ],
      exec: 'consultantScenario',
    },
    // 3. Dirección creando productos, eventos, videos y auditando
    director_management: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 5 },
        { duration: '15s', target: 15 },
        { duration: '5s', target: 0 },
      ],
      exec: 'directorScenario',
    },
    // 4. Seguridad anti-bots y mitigación
    security_audits: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 5 },
        { duration: '15s', target: 10 },
        { duration: '5s', target: 0 },
      ],
      exec: 'securityBotScenario',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<600'],
  },
};

// 1. ESCENARIO CLIENTES PÚBLICOS
export function shopperScenario() {
  const vu = __VU;
  const iter = __ITER;

  group('Navegación y Catálogo Público', () => {
    http.get(`${CONFIG.baseUrl}/api/catalog/products`, { headers: CONFIG.headers });
    http.get(`${CONFIG.baseUrl}/api/cms/slides`, { headers: CONFIG.headers });
    http.get(`${CONFIG.baseUrl}/api/cms/events`, { headers: CONFIG.headers });
    http.get(`${CONFIG.baseUrl}/api/tips`, { headers: CONFIG.headers });
  });

  group('Postulación a Trabaja con Nosotros (Lead)', () => {
    const leadPayload = JSON.stringify({
      fullName: `Aspirante Belleza ${vu}-${iter}`,
      phone: `310${String(1000000 + (vu * 100 + iter)).slice(0, 7)}`,
      city: 'Medellín',
      email: `aspirante_${vu}_${iter}@yanbalprestige.com`,
      roleInterest: 'consultora',
      experience: 'Asesoría dermo-estética',
      acceptedHabeasData: true,
      company_website: '',
      trapField: '',
    });

    const resLead = http.post(`${CONFIG.baseUrl}/api/leads/join`, leadPayload, { headers: CONFIG.headers });
    check(resLead, {
      'lead registrado 200': (r) => r.status === 200,
    });
  });

  group('Compra desde Carrito Web', () => {
    const idempKey = `order-k6-${vu}-${iter}-${Date.now()}`;
    const orderPayload = JSON.stringify({
      clientName: `Compradora Online ${vu}-${iter}`,
      clientPhone: `320${String(1000000 + (vu * 100 + iter)).slice(0, 7)}`,
      clientCity: 'Bogotá',
      clientAddress: `Cra 15 # 93-${vu % 50}`,
      clientEmail: `compradora_${vu}_${iter}@yanbalprestige.com`,
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

    check(resOrder, {
      'pedido creado (200 o 201)': (r) => r.status === 200 || r.status === 201,
    });
  });

  sleep(0.5);
}

// 2. ESCENARIO CONSULTORAS
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

    // Crear cliente CRM
    const clientPayload = JSON.stringify({
      fullName: `Clienta Frecuente ${vu}-${iter}`,
      phone: `315${String(1000000 + (vu * 100 + iter)).slice(0, 7)}`,
      city: 'Cali',
      email: `clienta_frecuente_${vu}_${iter}@yanbalprestige.com`,
      consultantId: 'usr-consultant-carolina',
    });
    http.post(`${CONFIG.baseUrl}/api/crm/clients`, clientPayload, { headers: authHeaders });

    // Consultar pedidos y gestionar el primero si existe
    const ordersRes = http.get(`${CONFIG.baseUrl}/api/orders?pageSize=5`, { headers: authHeaders });
    if (ordersRes.status === 200) {
      const ordersData = JSON.parse(ordersRes.body);
      const orders = ordersData.data || ordersData;
      if (orders && orders.length > 0) {
        const targetOrder = orders[0];

        // 1. Transición de entrega: en_camino -> entregado
        http.patch(`${CONFIG.baseUrl}/api/orders/${targetOrder.id}/status`, JSON.stringify({
          deliveryStatus: 'entregado',
        }), { headers: authHeaders });

        // 2. Registro de Abono / Pago
        http.put(`${CONFIG.baseUrl}/api/orders/${targetOrder.id}/payments`, JSON.stringify([
          {
            amount: targetOrder.totalAmount || 168000,
            method: 'transferencia',
            notes: `Pago verificado k6 VU ${vu}`,
          },
        ]), { headers: authHeaders });
      }
    }
  }

  sleep(0.8);
}

// 3. ESCENARIO DIRECTORA (MUTACIONES DE CATÁLOGO, CMS, EVENTOS, USUARIOS Y AUDITORÍA)
export function directorScenario() {
  const vu = __VU;
  const iter = __ITER;

  const authRes = http.post(`${CONFIG.baseUrl}/api/auth/login`, JSON.stringify({
    email: 'yulieth.directora@yanbalprestige.com',
    password: 'yanbal2026',
  }), { headers: CONFIG.headers });

  if (authRes.status === 200) {
    const token = JSON.parse(authRes.body).token;
    const authHeaders = { ...CONFIG.headers, Authorization: `Bearer ${token}` };

    // 1. Crear Nuevo Producto Individual
    const prodId = `prod-k6-${vu}-${iter}-${Date.now()}`;
    const newProduct = JSON.stringify({
      id: prodId,
      code: `SKU-K6-${vu}-${iter}`,
      name: `Sérum Hidratante Botánico Edición ${vu}-${iter}`,
      category: 'rostro',
      price: 185000,
      originalPrice: 220000,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      description: 'Fórmula enriquecida con ácido hialurónico botánico de uva andina.',
      badge: 'Lanzamiento k6',
      isActive: true,
    });
    const resProd = http.post(`${CONFIG.baseUrl}/api/catalog/products`, newProduct, { headers: authHeaders });
    check(resProd, { 'producto nuevo creado 200': (r) => r.status === 200 });

    // 2. Carga Masiva de Productos en Lote (Batch CSV Simulation)
    if (iter === 0) {
      const batchPayload = JSON.stringify([
        {
          id: `batch-${vu}-1-${Date.now()}`,
          code: `SKU-BAT-A-${vu}`,
          name: `Óleo Bio-Regenerador Noche ${vu}`,
          category: 'rostro',
          price: 198000,
          image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
          isActive: true,
        },
        {
          id: `batch-${vu}-2-${Date.now()}`,
          code: `SKU-BAT-B-${vu}`,
          name: `Bruma Hidratante Camu Camu ${vu}`,
          category: 'rostro',
          price: 95000,
          image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
          isActive: true,
        },
      ]);
      const resBatch = http.post(`${CONFIG.baseUrl}/api/catalog/products/batch`, batchPayload, { headers: authHeaders });
      check(resBatch, { 'lote de productos importado 200': (r) => r.status === 200 });
    }

    // 3. Crear Nuevo Evento CMS
    const eventPayload = JSON.stringify({
      id: `evt-k6-${vu}-${iter}-${Date.now()}`,
      title: `Masterclass Yanbal Prestige VU ${vu}-${iter}`,
      date: '2026-12-15',
      time: '18:00',
      modality: 'Virtual',
      location: 'Bogotá / Zoom',
      description: 'Lanzamiento de campaña y tendencias de belleza botánica.',
      spots: '50 cupos disponibles',
      isActive: true,
    });
    const resEvt = http.post(`${CONFIG.baseUrl}/api/cms/events`, eventPayload, { headers: authHeaders });
    check(resEvt, { 'evento CMS creado 200': (r) => r.status === 200 });

    // 4. Crear Nuevo Video Tutorial
    const videoPayload = JSON.stringify({
      id: `vid-k6-${vu}-${iter}-${Date.now()}`,
      title: `Rutina Dermo-Facial Paso a Paso ${vu}-${iter}`,
      category: 'Rutinas',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: '04:30',
      description: 'Aprende la técnica de aplicación en 4 toques.',
      isActive: true,
    });
    const resVid = http.post(`${CONFIG.baseUrl}/api/cms/videos`, videoPayload, { headers: authHeaders });
    check(resVid, { 'video CMS creado 200': (r) => r.status === 200 });

    // 5. Crear Nuevo Tip de Belleza
    const tipPayload = JSON.stringify({
      id: `tip-k6-${vu}-${iter}-${Date.now()}`,
      title: `El Secreto de la Doble Limpieza ${vu}-${iter}`,
      category: 'Cuidado Facial',
      content: 'Comienza con bálsamo oleoso para remover protector solar y maquillaje, seguido de limpiador en gel.',
      isActive: true,
    });
    const resTip = http.post(`${CONFIG.baseUrl}/api/tips`, tipPayload, { headers: authHeaders });
    check(resTip, { 'tip creado 200': (r) => r.status === 200 });

    // 6. Crear Nueva Consultora en la Red (Auth/Users)
    const newUserId = `usr-k6-${vu}-${iter}-${Date.now()}`;
    const userPayload = JSON.stringify({
      id: newUserId,
      fullName: `Consultora Nueva ${vu}-${iter}`,
      email: `consultora_${vu}_${iter}_${Date.now()}@yanbalprestige.com`,
      role: 2, // Consultant
      phone: `301${String(1000000 + (vu * 100 + iter)).slice(0, 7)}`,
      documentId: `11${String(10000000 + (vu * 100 + iter)).slice(0, 8)}`,
      zone: 'Zona 102 - Antioquia',
      isActive: true,
      leaderId: 'usr-leader-andrea',
    });
    const resUser = http.post(`${CONFIG.baseUrl}/api/auth/users`, userPayload, { headers: authHeaders });
    check(resUser, { 'usuario consultora creado 200': (r) => r.status === 200 });

    // 7. Consultar Bitácora de Auditoría Forense
    const auditRes = http.get(`${CONFIG.baseUrl}/api/audit?pageSize=20`, { headers: authHeaders });
    check(auditRes, {
      'auditoría accesible 200': (r) => r.status === 200,
      'auditoría registra eventos': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.total > 0;
        } catch {
          return false;
        }
      },
    });
  }

  sleep(1.0);
}

// 4. ESCENARIO DE SEGURIDAD (Bots Honeypot y Ataques)
export function securityBotScenario() {
  const vu = __VU;

  // Bot Honeypot en Pedidos
  const botOrder = JSON.stringify({
    clientName: `Bot Scraper ${vu}`,
    clientPhone: '3000000000',
    clientCity: 'Bogota',
    consultantId: CONFIG.defaultConsultant.id,
    consultantName: CONFIG.defaultConsultant.name,
    trapField: 'malicious_bot_data',
    acceptedHabeasData: true,
    items: [{ productId: CONFIG.products.primary.productId, productSku: CONFIG.products.primary.productSku, productName: 'Test', unitPrice: 168000, quantity: 1 }],
  });
  const resBotOrder = http.post(`${CONFIG.baseUrl}/api/orders`, botOrder, {
    headers: CONFIG.headers,
    responseCallback: http.expectedStatuses(400),
  });
  check(resBotOrder, { 'bot honeypot pedido bloqueado 400': (r) => r.status === 400 });

  // Bot Honeypot en Leads
  const botLead = JSON.stringify({
    fullName: `Bot Spammer ${vu}`,
    phone: '3109999999',
    city: 'Cali',
    roleInterest: 'consultora',
    acceptedHabeasData: true,
    company_website: 'http://spam-site.com',
  });
  const resBotLead = http.post(`${CONFIG.baseUrl}/api/leads/join`, botLead, {
    headers: CONFIG.headers,
    responseCallback: http.expectedStatuses(400),
  });
  check(resBotLead, { 'bot honeypot lead bloqueado 400': (r) => r.status === 400 });

  // Intento de contraseña inválida
  const bruteForce = JSON.stringify({ email: 'director@yanbalprestige.com', password: 'bad_password' });
  const resBrute = http.post(`${CONFIG.baseUrl}/api/auth/login`, bruteForce, {
    headers: CONFIG.headers,
    responseCallback: http.expectedStatuses(401, 429),
  });
  check(resBrute, { 'fuerza bruta mitigada 401/429': (r) => r.status === 401 || r.status === 429 });

  sleep(0.5);
}
