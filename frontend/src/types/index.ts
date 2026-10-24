export type TabType = 'inicio' | 'catalogo' | 'quienes-somos' | 'eventos' | 'unete';

export type UserRole = 'SUPER_ADMIN' | 'DIRECTORA' | 'LIDER_ZONA' | 'CONSULTORA';

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
  description: string;
  isTop?: boolean;
  badge?: string;
  usageSteps: string[];
  consultantTip: string;
  active: boolean; // Estado: true (En Catálogo) o false (Agotado/Pausado)
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
