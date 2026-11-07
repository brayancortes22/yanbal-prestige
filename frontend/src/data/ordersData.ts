import type { Order } from '../types';

/**
 * Fechas de demostración relativas al día actual.
 * Antes estaban fijadas en abril de 2026 y, al abrir el panel meses después,
 * la gráfica de "últimos 5 meses" aparecía vacía aunque existieran facturas.
 * Con esto el demo siempre muestra actividad reciente.
 */
const relativeIso = (monthsAgo: number, day: number, hour: number): string => {
  const now = new Date();
  const safeDay = monthsAgo === 0 ? Math.min(day, now.getUTCDate()) : day;
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, safeDay, hour, 0, 0)
  ).toISOString();
};

const invoiceNumber = (sequence: number): string =>
  `FAC-${new Date().getUTCFullYear()}-${String(sequence).padStart(3, '0')}`;

export const initialOrders: Order[] = [
  {
    id: 'ord-2026-001',
    invoiceNumber: invoiceNumber(1),
    clientId: 'cli-1',
    clientName: 'Camila Restrepo',
    clientPhone: '+57 312 456 7890',
    clientCity: 'Bogotá D.C.',
    clientAddress: 'Calle 127 # 15-42 Apto 402',
    consultantId: 'usr-2',
    consultantName: 'Carolina Mejía',
    items: [
      {
        productId: 'extracto-divino',
        productCode: 'EXT-01',
        productName: 'Suero Óleo Reparador Extracto Divino',
        unitPrice: 189000,
        quantity: 1,
        subtotal: 189000,
      },
      {
        productId: 'total-block-100',
        productCode: 'SOL-01',
        productName: 'Total Block Ultraprotección SPF 100',
        unitPrice: 94000,
        quantity: 1,
        subtotal: 94000,
      },
    ],
    totalAmount: 283000,
    paymentStatus: 'pagado',
    deliveryStatus: 'entregado',
    source: 'web_catalogo',
    notes: 'Entregar en portería con turno de tarde.',
    createdAt: relativeIso(3, 18, 14),
    updatedAt: relativeIso(3, 18, 18),
  },
  {
    id: 'ord-2026-002',
    invoiceNumber: invoiceNumber(2),
    clientId: 'cli-2',
    clientName: 'Valentina Morales',
    clientPhone: '+57 318 999 1122',
    clientCity: 'Medellín',
    clientAddress: 'Carrera 43A # 1-50',
    consultantId: 'usr-2',
    consultantName: 'Carolina Mejía',
    items: [
      {
        productId: 'ccori-cristal',
        productCode: 'PERF-01',
        productName: 'Ccori Cristal Parfum',
        unitPrice: 165000,
        quantity: 2,
        subtotal: 330000,
      },
    ],
    totalAmount: 330000,
    paymentStatus: 'pendiente',
    deliveryStatus: 'preparacion',
    source: 'venta_directa',
    notes: 'Pago contraentrega en efectivo o Nequi.',
    createdAt: relativeIso(2, 20, 9),
    updatedAt: relativeIso(2, 20, 9),
  },
  {
    id: 'ord-2026-003',
    invoiceNumber: invoiceNumber(3),
    clientName: 'Mariana Duque',
    clientPhone: '+57 301 777 4455',
    clientCity: 'Cali',
    clientAddress: 'Av. San Joaquín # 14-20',
    consultantId: 'usr-3',
    consultantName: 'Andrea Gómez',
    items: [
      {
        productId: 'total-block-100',
        productCode: 'SOL-01',
        productName: 'Total Block Ultraprotección SPF 100',
        unitPrice: 94000,
        quantity: 2,
        subtotal: 188000,
      },
      {
        productId: 'extracto-divino',
        productCode: 'EXT-01',
        productName: 'Suero Óleo Reparador Extracto Divino',
        unitPrice: 189000,
        quantity: 1,
        subtotal: 189000,
      },
    ],
    totalAmount: 377000,
    paymentStatus: 'abono',
    deliveryStatus: 'camino',
    source: 'web_catalogo',
    notes: 'Abono previo del 50% vía transferencia bancaria.',
    createdAt: relativeIso(1, 21, 11),
    updatedAt: relativeIso(1, 21, 16),
  },
  {
    id: 'ord-2026-004',
    invoiceNumber: invoiceNumber(4),
    clientName: 'Lucía Fernández',
    clientPhone: '+57 311 234 5678',
    clientCity: 'Bogotá D.C.',
    clientAddress: 'Calle 85 # 11-53',
    consultantId: 'usr-1',
    consultantName: 'Yuli Cortés',
    items: [
      {
        productId: 'ccori-cristal',
        productCode: 'PERF-01',
        productName: 'Ccori Cristal Parfum',
        unitPrice: 165000,
        quantity: 1,
        subtotal: 165000,
      },
    ],
    totalAmount: 165000,
    paymentStatus: 'pagado',
    deliveryStatus: 'entregado',
    source: 'venta_directa',
    notes: 'Cliente VIP directa de la dirección.',
    createdAt: relativeIso(0, 22, 17),
    updatedAt: relativeIso(0, 22, 19),
  },
];
