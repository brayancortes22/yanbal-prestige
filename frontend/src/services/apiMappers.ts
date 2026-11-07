import type {
  AppUser,
  ConsultantClient,
  MediaItem,
  Order,
  PaymentMethod,
  PaymentRecord,
  Product,
  UserRole,
} from '../types';

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  role: number | string;
  phone?: string;
  isActive: boolean;
  documentId?: string;
  zone?: string;
  leaderId?: string | null;
}

export interface ApiProductMedia {
  type: string;
  url: string;
  alt?: string | null;
}

export interface ApiProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  media?: ApiProductMedia[] | null;
  description: string;
  badge?: string | null;
  usageStepsJson?: string;
  consultantTip?: string;
  botanicalTitle?: string;
  botanicalDesc?: string;
  warrantyTitle?: string;
  warrantyDesc?: string;
  commitmentTitle?: string;
  commitmentText?: string;
  isActive: boolean;
}

export interface ApiClient {
  id: string;
  consultantId: string;
  fullName: string;
  phone: string;
  email?: string;
  documentId?: string;
  address?: string;
  neighborhood?: string;
  postalCode?: string;
  city?: string;
  skinType: string;
  favoriteCategory?: string;
  fragrancePreference?: string | null;
  jewelryPreference?: string | null;
  notes?: string | null;
  lastContactDate: string;
  createdAt?: string;
}

export interface ApiPayment {
  id: string;
  amount: number;
  method: string;
  note?: string | null;
  date: string;
}

export interface ApiOrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productSku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ApiOrder {
  id: string;
  invoiceNumber: string;
  clientId?: string | null;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress?: string;
  clientEmail?: string | null;
  clientDocumentId?: string | null;
  clientNeighborhood?: string | null;
  clientPostalCode?: string | null;
  consultantId: string;
  consultantName: string;
  totalAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  source: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: ApiOrderItem[];
  payments?: ApiPayment[];
  idempotencyKey?: string | null;
  acceptedHabeasData?: boolean;
}

const numericRole: Record<UserRole, number> = {
  DIRECTORA: 1,
  CONSULTORA: 2,
  CLIENTE: 3,
  LIDER_ZONA: 4,
  ASISTENTE: 5,
  SUPER_ADMIN: 1,
};

const roleFromApi = (role: number | string): UserRole => {
  if (typeof role === 'string') {
    const clean = role.toLowerCase();
    if (clean.includes('developer') || clean.includes('desarrollador') || clean.includes('soporte')) {
      return 'SUPER_ADMIN';
    }
    if (clean.includes('director') || clean.includes('admin')) return 'DIRECTORA';
    if (clean.includes('assistant') || clean.includes('asistente')) return 'ASISTENTE';
    if (clean.includes('leader') || clean.includes('lider')) return 'LIDER_ZONA';
    if (clean.includes('consult')) return 'CONSULTORA';
    return 'CLIENTE';
  }
  switch (role) {
    case 1:
      return 'DIRECTORA';
    case 2:
      return 'CONSULTORA';
    case 4:
      return 'LIDER_ZONA';
    case 5:
      return 'ASISTENTE';
    case 6:
      return 'SUPER_ADMIN';
    default:
      return 'CLIENTE';
  }
};

const paymentMethod = (value: string): PaymentMethod => {
  const allowed: PaymentMethod[] = [
    'efectivo',
    'transferencia',
    'nequi',
    'daviplata',
    'tarjeta',
    'otro',
    'reembolso',
  ];
  const clean = (value || '').toLowerCase() as PaymentMethod;
  return allowed.includes(clean) ? clean : 'otro';
};

export const mapApiUser = (user: ApiUser): AppUser => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: roleFromApi(user.role),
  documentId: user.documentId || '',
  phone: user.phone || '',
  zone: user.zone || '',
  active: user.isActive,
  leaderId: user.leaderId || undefined,
});

export const toApiUser = (user: AppUser) => ({
  id: user.id,
  fullName: user.name,
  email: user.email,
  role: numericRole[user.role] ?? 2,
  phone: user.phone,
  isActive: user.active,
  documentId: user.documentId,
  zone: user.zone,
  leaderId: user.leaderId ?? null,
});

export const mapApiProduct = (product: ApiProduct): Product => {
  let steps: string[] = [];
  try {
    const parsed = JSON.parse(product.usageStepsJson || '[]');
    if (Array.isArray(parsed)) steps = parsed.map(String);
  } catch {
    steps = [];
  }
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    category: product.category as Product['category'],
    categoryLabel: product.categoryLabel || product.category,
    price: Number(product.price),
    originalPrice: product.originalPrice ?? undefined,
    image: product.image,
    media: (product.media || []).map((item, index) => ({
      id: `${product.id}-media-${index}`,
      url: item.url,
      type: (item.type === 'video' ? 'video' : 'image') as MediaItem['type'],
      alt: item.alt || undefined,
    })),
    description: product.description,
    badge: product.badge ?? undefined,
    usageSteps: steps,
    consultantTip: product.consultantTip || '',
    botanicalTitle: product.botanicalTitle,
    botanicalDesc: product.botanicalDesc,
    warrantyTitle: product.warrantyTitle,
    warrantyDesc: product.warrantyDesc,
    commitmentTitle: product.commitmentTitle,
    commitmentText: product.commitmentText,
    active: product.isActive,
  };
};

export const toApiProduct = (product: Product) => ({
  id: product.id,
  code: product.code,
  name: product.name,
  category: product.category,
  categoryLabel: product.categoryLabel,
  price: product.price,
  originalPrice: product.originalPrice ?? null,
  image: product.image,
  // Solo se persisten archivos del servidor o URLs; los blob locales no
  // sobreviven a la recarga y no deben viajar a la API.
  media: (product.media || [])
    .filter((item) => item.url && !item.url.startsWith('blob:'))
    .map((item) => ({
      type: item.type,
      url: item.url,
      alt: item.alt ?? null,
    })),
  description: product.description,
  badge: product.badge ?? null,
  usageStepsJson: JSON.stringify(product.usageSteps || []),
  consultantTip: product.consultantTip || '',
  botanicalTitle: product.botanicalTitle || 'Fórmula Botánica',
  botanicalDesc: product.botanicalDesc || 'Ingredientes activos puros',
  warrantyTitle: product.warrantyTitle || '100% Original Yanbal',
  warrantyDesc: product.warrantyDesc || 'Garantía oficial de fábrica',
  commitmentTitle: product.commitmentTitle || 'Compromiso Yanbal Prestige',
  commitmentText: product.commitmentText || '',
  isActive: product.active,
});

export const mapApiClient = (client: ApiClient): ConsultantClient => ({
  id: client.id,
  consultantId: client.consultantId,
  name: client.fullName,
  phone: client.phone,
  email: client.email || '',
  documentId: client.documentId || '',
  address: client.address || '',
  neighborhood: client.neighborhood || '',
  postalCode: client.postalCode || '',
  city: client.city || '',
  skinType: (client.skinType || 'Mixta') as ConsultantClient['skinType'],
  favoriteCategory:
    (client.favoriteCategory || 'Tratamiento Facial') as ConsultantClient['favoriteCategory'],
  notes: client.notes || '',
  lastContactDate: (client.lastContactDate || new Date().toISOString()).slice(0, 10),
});

export const toApiClient = (client: ConsultantClient) => ({
  id: client.id.startsWith('cli-') && client.id.length > 20 ? client.id : client.id,
  consultantId: client.consultantId,
  fullName: client.name,
  phone: client.phone,
  email: client.email || '',
  documentId: client.documentId || '',
  address: client.address || '',
  neighborhood: client.neighborhood || '',
  postalCode: client.postalCode || '',
  city: client.city || '',
  skinType: client.skinType,
  favoriteCategory: client.favoriteCategory,
  notes: client.notes,
  lastContactDate: client.lastContactDate,
});

export const mapApiPayment = (payment: ApiPayment): PaymentRecord => ({
  id: payment.id,
  amount: Number(payment.amount),
  method: paymentMethod(payment.method),
  note: payment.note || undefined,
  date: payment.date,
});

export const mapApiOrder = (order: ApiOrder): Order => ({
  id: order.id,
  invoiceNumber: order.invoiceNumber,
  clientId: order.clientId || undefined,
  clientName: order.clientName,
  clientPhone: order.clientPhone,
  clientCity: order.clientCity,
  clientAddress: order.clientAddress || '',
  clientEmail: order.clientEmail || '',
  clientDocumentId: order.clientDocumentId || '',
  clientNeighborhood: order.clientNeighborhood || '',
  clientPostalCode: order.clientPostalCode || '',
  consultantId: order.consultantId,
  consultantName: order.consultantName,
  items: (order.items || []).map((item) => ({
    productId: item.productId,
    productCode: item.productSku,
    productName: item.productName,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    subtotal: Number(item.subtotal),
  })),
  totalAmount: Number(order.totalAmount),
  paymentStatus: order.paymentStatus as Order['paymentStatus'],
  deliveryStatus: order.deliveryStatus as Order['deliveryStatus'],
  source: order.source as Order['source'],
  notes: order.notes || undefined,
  payments: (order.payments || []).map(mapApiPayment),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const toApiCreateOrder = (order: Order) => ({
  clientName: order.clientName,
  clientPhone: order.clientPhone,
  clientCity: order.clientCity,
  clientAddress: order.clientAddress || '',
  clientEmail: order.clientEmail || '',
  clientDocumentId: order.clientDocumentId || '',
  clientNeighborhood: order.clientNeighborhood || '',
  clientPostalCode: order.clientPostalCode || '',
  clientId: order.clientId ?? null,
  consultantId: order.consultantId,
  consultantName: order.consultantName,
  idempotencyKey: `web-${order.id}`,
  source: order.source,
  notes: order.notes ?? null,
  items: order.items.map((item) => ({
    productId: item.productId,
    productSku: item.productCode,
    productName: item.productName,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  })),
  acceptedHabeasData: true,
  payments: (order.payments || []).map((payment) => ({
    amount: payment.amount,
    method: payment.method,
    note: payment.note ?? null,
    date: payment.date,
  })),
});

export const toApiPayments = (payments: PaymentRecord[]) =>
  payments.map((payment) => ({
    amount: payment.amount,
    method: payment.method,
    note: payment.note ?? null,
    date: payment.date,
  }));
