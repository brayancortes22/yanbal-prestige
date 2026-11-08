// Configuración centralizada para suites de pruebas k6 en Yanbal Prestige
export const CONFIG = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:5075',
  frontendUrl: __ENV.FRONTEND_URL || 'http://127.0.0.1:5173',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-load-tester/1.0 (YanbalPrestige-QA)',
  },
  products: {
    primary: {
      productId: 'extracto-divino',
      productSku: 'SKU-ED-001',
      productName: 'Extracto Divino Concentrado Reactivador',
      unitPrice: 168000,
    },
    secondary: {
      productId: 'libertage-nocturne',
      productSku: 'SKU-LN-003',
      productName: 'Libertâge Nocturne Sérum Reparador',
      unitPrice: 155000,
    },
  },
  defaultConsultant: {
    id: 'usr-consultant-carolina',
    name: 'Carolina Mejía (Consultora)',
  },
};
