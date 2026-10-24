export type TabType = 'inicio' | 'catalogo' | 'quienes-somos' | 'eventos' | 'unete';

export interface Product {
  id: string;
  code: string;
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
}
