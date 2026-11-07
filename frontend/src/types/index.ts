export type TabType = 'inicio' | 'catalogo' | 'quienes-somos' | 'eventos' | 'tips' | 'unete';

export type MediaType = 'image' | 'video';

/**
 * Recurso multimedia asociado a un producto, evento o tip.
 * `demo` marca archivos que viven solo en la sesión del navegador
 * (URL.createObjectURL) y por tanto desaparecen al recargar.
 */
export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  alt?: string;
  /** Imagen de portada para videos */
  poster?: string;
  demo?: boolean;
  /** Nombre original del archivo, útil en el panel de administración */
  fileName?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'DIRECTORA' | 'LIDER_ZONA' | 'CONSULTORA' | 'CLIENTE';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  documentId: string; // Cédula de Ciudadanía para autodesbloqueo
  phone: string;
  zone: string;
  active: boolean;
}

export interface ConsultantClient {
  id: string;
  name: string;
  phone: string;
  skinType: 'Normal' | 'Grasa' | 'Mixta' | 'Seca' | 'Sensible';
  favoriteCategory: 'Tratamiento Facial' | 'Perfumería' | 'Protección Solar' | 'Maquillaje' | 'Joyería Fina';
  notes: string;
  lastContactDate: string;
}

export interface AnnouncementConfig {
  topBannerText: string;
  topBannerActive: boolean;
  campaignName: string;
  campaignDiscountText: string;
  whatsAppWelcomeMsg: string;
  updatedAt: string;
}

export interface AboutContentConfig {
  historyTag: string;
  historyTitle: string;
  historyDesc: string;
  missionTag: string;
  missionTitle: string;
  missionDesc: string;
  consultantsCountText: string;
  adviceTag: string;
  adviceTitle: string;
  adviceDesc: string;
  updatedAt: string;
}

export interface JoinContentConfig {
  tag: string;
  title: string;
  subtitle: string;
  consultantBadge: string;
  consultantTitle: string;
  consultantDesc: string;
  consultantBenefits: string[];
  consultantButtonText: string;
  directorBadge: string;
  directorTitle: string;
  directorDesc: string;
  directorBenefits: string[];
  directorButtonText: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  badge: string;
  image: string;
  active: boolean;
}

export interface DigitalCatalogConfig {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  coverImage: string;
  specialEditionText: string;
  discountText: string;
}

export interface VideoTipItem {
  id: string;
  title: string;
  duration: string;
  image: string;
  description: string;
  active: boolean;
}

export type TipCategory = 'Rutina' | 'Maquillaje' | 'Cuidado' | 'Negocio';

/**
 * Consejo o artículo publicado en la vista pública /tips.
 * `content` usa saltos de línea dobles para separar párrafos y
 * líneas que empiezan por "- " para listas.
 */
export interface TipItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: TipCategory;
  image: string;
  videoUrl?: string;
  author: string;
  featured: boolean;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetRequest {
  id: string;
  userEmail: string;
  userName: string;
  pinCode: string;
  documentId: string;
  status: 'pending' | 'approved' | 'completed';
  createdAt: string;
  expiresAt: string;
}

export interface Product {
  id: string;
  code: string; // Código de artículo / SKU Yanbal
  name: string;
  category: 'rostro' | 'perfumes' | 'maquillaje' | 'joyeria' | 'solar';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  image: string;
  /** Galería de fotos y videos. La primera imagen se usa como portada. */
  media?: MediaItem[];
  description: string;
  isTop?: boolean;
  badge?: string;
  usageSteps: string[];
  consultantTip: string;
  botanicalTitle?: string;
  botanicalDesc?: string;
  warrantyTitle?: string;
  warrantyDesc?: string;
  commitmentTitle?: string;
  commitmentText?: string;
  active: boolean; // Estado: true (En Catálogo) o false (Agotado/Pausado)
}

export type PaymentStatus = 'pendiente' | 'abono' | 'pagado';
export type DeliveryStatus = 'preparacion' | 'camino' | 'entregado';
export type OrderSource = 'web_catalogo' | 'venta_directa';

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  invoiceNumber: string; // ej. FAC-2026-001
  clientId?: string;
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress?: string;
  consultantId: string;
  consultantName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  source: OrderSource;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface LineAccordionItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  claims: string[];
  categoryFilter: 'rostro' | 'perfumes' | 'maquillaje' | 'joyeria' | 'solar';
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  modality: 'Presencial' | 'Virtual Vía Zoom';
  location: string;
  image: string;
  /** Galería de fotos y videos del taller o evento. */
  media?: MediaItem[];
  description: string;
  spots: string;
}

export interface LeadProspect {
  fullName: string;
  phone: string;
  city: string;
  roleInterest: string;
  acceptedHabeasData: boolean;
  trapField?: string;
  turnstileToken?: string;
}
