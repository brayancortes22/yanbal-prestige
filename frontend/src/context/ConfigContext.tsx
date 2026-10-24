import React, { createContext, useContext } from 'react';
import type { 
  AnnouncementConfig, 
  AppUser, 
  ConsultantClient, 
  PasswordResetRequest, 
  Product,
  AboutContentConfig,
  EventItem,
  HeroSlide,
  LineAccordionItem,
  DigitalCatalogConfig,
  VideoTipItem
} from '../types';
import { 
  productsData, 
  eventsData, 
  heroSlidesData, 
  linesAccordionData, 
  digitalCatalogData, 
  videoTipsData 
} from '../data/catalogData';
import { useCacheSync } from '../hooks/useCacheSync';

const defaultAnnouncements: AnnouncementConfig = {
  topBannerText: 'Campaña 05 Yanbal: Envíos gratis por compras superiores a $150.000 COP y asesoría dermocosmética sin costo.',
  topBannerActive: true,
  campaignName: 'Campaña 05 - Esencia & Cuidado',
  campaignDiscountText: 'Hasta 35% OFF en Línea Sentiva y Fragancias Ccori',
  whatsAppWelcomeMsg: 'Hola Directora Yuli, vi el catálogo Yanbal Prestige y deseo una asesoría personalizada.',
  updatedAt: new Date().toISOString(),
};

const defaultAbout: AboutContentConfig = {
  historyTag: 'Nuestra Historia & Propósito',
  historyTitle: 'Quiénes Somos',
  historyDesc: 'Somos una comunidad de líderes y consultoras de belleza que fusionamos la ciencia cosmética de Yanbal con un acompañamiento cercano para potenciar tu autoestima y bienestar.',
  missionTag: 'Misión de Equipo',
  missionTitle: 'Transformamos vidas a través de la belleza responsable y el liderazgo financiero.',
  missionDesc: 'Creemos que la cosmética va mucho más allá de un producto; es una herramienta de empoderamiento. Guiamos a mujeres en Colombia a construir negocios rentables sin sacrificar tiempo con su familia, respaldadas por una multinacional de 55 años de trayectoria.',
  consultantsCountText: '+45 Consultoras Activas',
  adviceTag: 'Asesoría Fisiológica',
  adviceTitle: 'Diagnóstico Cutáneo Personalizado',
  adviceDesc: 'Cada tipo de piel tiene necesidades distintas. Evaluamos tu fototipo y condición cutánea antes de recomendarte cualquier tratamiento.',
  updatedAt: new Date().toISOString(),
};

const initialUsers: AppUser[] = [
  {
    id: 'usr-1',
    name: 'Yuli Cortés',
    email: 'yuli.directora@yanbalprestige.com',
    role: 'DIRECTORA',
    documentId: '1020304050',
    phone: '+57 310 000 0000',
    zone: 'Zona 12 - Bogotá Norte',
    active: true,
  },
  {
    id: 'usr-2',
    name: 'Carolina Mejía',
    email: 'carolina.consultora@yanbalprestige.com',
    role: 'CONSULTORA',
    documentId: '1098765432',
    phone: '+57 315 222 3344',
    zone: 'Zona 12 - Suba',
    active: true,
  },
  {
    id: 'usr-3',
    name: 'Andrea Gómez',
    email: 'andrea.lider@yanbalprestige.com',
    role: 'LIDER_ZONA',
    documentId: '52890123',
    phone: '+57 320 888 9900',
    zone: 'Zona 15 - Medellín',
    active: true,
  },
];

const initialClients: ConsultantClient[] = [
  {
    id: 'cli-1',
    name: 'Camila Restrepo',
    phone: '+57 312 456 7890',
    skinType: 'Mixta',
    favoriteCategory: 'Tratamiento Facial',
    notes: 'Usa Suero Extracto Divino cada noche. Le encanta la textura no grasa.',
    lastContactDate: '2026-04-12',
  },
  {
    id: 'cli-2',
    name: 'Valentina Morales',
    phone: '+57 318 999 1122',
    skinType: 'Normal',
    favoriteCategory: 'Perfumería',
    notes: 'Fanática de Ccori Cristal. Comprar en fechas especiales o promociones.',
    lastContactDate: '2026-04-18',
  },
];

interface ConfigContextType {
  announcements: AnnouncementConfig;
  setAnnouncements: (config: AnnouncementConfig) => void;
  aboutContent: AboutContentConfig;
  setAboutContent: (config: AboutContentConfig) => void;
  products: Product[];
  saveProduct: (product: Product) => void;
  toggleProductActive: (id: string) => void;
  deleteProduct: (id: string) => void;
  users: AppUser[];
  saveUser: (user: AppUser) => void;
  toggleUserActive: (id: string) => void;
  deleteUser: (id: string) => void;
  clients: ConsultantClient[];
  addClient: (c: Omit<ConsultantClient, 'id'>) => void;
  updateClient: (c: ConsultantClient) => void;
  deleteClient: (id: string) => void;
  events: EventItem[];
  saveEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  heroSlides: HeroSlide[];
  saveHeroSlide: (slide: HeroSlide) => void;
  toggleHeroSlide: (id: string) => void;
  deleteHeroSlide: (id: string) => void;
  linesAccordion: LineAccordionItem[];
  saveLineAccordion: (line: LineAccordionItem) => void;
  digitalCatalog: DigitalCatalogConfig;
  setDigitalCatalog: (cfg: DigitalCatalogConfig) => void;
  videoTips: VideoTipItem[];
  saveVideoTip: (vid: VideoTipItem) => void;
  toggleVideoTip: (id: string) => void;
  deleteVideoTip: (id: string) => void;
  resetRequests: PasswordResetRequest[];
  createResetRequest: (email: string, docId: string) => PasswordResetRequest;
  approveResetRequest: (reqId: string) => void;
  completeResetPassword: (reqId: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: announcements, updateData: setAnnouncements } = useCacheSync<AnnouncementConfig>('announcements_v2', defaultAnnouncements);
  const { data: aboutContent, updateData: setAboutContent } = useCacheSync<AboutContentConfig>('about_content_v2', defaultAbout);
  const { data: products, updateData: setProducts } = useCacheSync<Product[]>('products_v3', productsData);
  const { data: users, updateData: setUsers } = useCacheSync<AppUser[]>('users_v3', initialUsers);
  const { data: clients, updateData: setClients } = useCacheSync<ConsultantClient[]>('clients_v3', initialClients);
  const { data: events, updateData: setEvents } = useCacheSync<EventItem[]>('events_v3', eventsData);
  const { data: heroSlides, updateData: setHeroSlides } = useCacheSync<HeroSlide[]>('hero_slides_v1', heroSlidesData);
  const { data: linesAccordion, updateData: setLinesAccordion } = useCacheSync<LineAccordionItem[]>('lines_accordion_v1', linesAccordionData);
  const { data: digitalCatalog, updateData: setDigitalCatalog } = useCacheSync<DigitalCatalogConfig>('digital_catalog_v1', digitalCatalogData);
  const { data: videoTips, updateData: setVideoTips } = useCacheSync<VideoTipItem[]>('video_tips_v1', videoTipsData);
  const { data: resetRequests, updateData: setResetRequests } = useCacheSync<PasswordResetRequest[]>('reset_requests_v3', []);

  // CRUD Catálogo
  const saveProduct = (prod: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === prod.id);
      return exists ? prev.map((p) => (p.id === prod.id ? prod : p)) : [prod, ...prev];
    });
  };
  const toggleProductActive = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // CRUD Usuarios
  const saveUser = (u: AppUser) => {
    setUsers((prev) => {
      const exists = prev.some((item) => item.id === u.id);
      return exists ? prev.map((item) => (item.id === u.id ? u : item)) : [u, ...prev];
    });
  };
  const toggleUserActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };
  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // CRUD Clientas CRM
  const addClient = (c: Omit<ConsultantClient, 'id'>) => {
    const newClient: ConsultantClient = { ...c, id: `cli-${Date.now()}` };
    setClients((prev) => [newClient, ...prev]);
  };
  const updateClient = (c: ConsultantClient) => {
    setClients((prev) => prev.map((item) => (item.id === c.id ? c : item)));
  };
  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((item) => item.id !== id));
  };

  // CRUD Eventos
  const saveEvent = (ev: EventItem) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === ev.id);
      return exists ? prev.map((e) => (e.id === ev.id ? ev : e)) : [ev, ...prev];
    });
  };
  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // CRUD Hero Slides
  const saveHeroSlide = (s: HeroSlide) => {
    setHeroSlides((prev) => {
      const exists = prev.some((item) => item.id === s.id);
      return exists ? prev.map((item) => (item.id === s.id ? s : item)) : [...prev, s];
    });
  };
  const toggleHeroSlide = (id: string) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };
  const deleteHeroSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
  };

  // CRUD Líneas
  const saveLineAccordion = (line: LineAccordionItem) => {
    setLinesAccordion((prev) => prev.map((l) => (l.id === line.id ? line : l)));
  };

  // CRUD Videos
  const saveVideoTip = (vid: VideoTipItem) => {
    setVideoTips((prev) => {
      const exists = prev.some((v) => v.id === vid.id);
      return exists ? prev.map((v) => (v.id === vid.id ? vid : v)) : [...prev, vid];
    });
  };
  const toggleVideoTip = (id: string) => {
    setVideoTips((prev) => prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v)));
  };
  const deleteVideoTip = (id: string) => {
    setVideoTips((prev) => prev.filter((v) => v.id !== id));
  };

  // Recuperación OTP
  const createResetRequest = (email: string, docId: string): PasswordResetRequest => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newReq: PasswordResetRequest = {
      id: `req-${Date.now()}`,
      userEmail: email,
      userName: user ? user.name : 'Consultora Yanbal',
      pinCode: randomPin,
      documentId: docId,
      status: user && user.documentId === docId ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
    setResetRequests((prev) => [newReq, ...prev]);
    return newReq;
  };
  const approveResetRequest = (reqId: string) => {
    setResetRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: 'approved' } : r)));
  };
  const completeResetPassword = (reqId: string) => {
    setResetRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: 'completed' } : r)));
  };

  return (
    <ConfigContext.Provider
      value={{
        announcements, setAnnouncements,
        aboutContent, setAboutContent,
        products, saveProduct, toggleProductActive, deleteProduct,
        users, saveUser, toggleUserActive, deleteUser,
        clients, addClient, updateClient, deleteClient,
        events, saveEvent, deleteEvent,
        heroSlides, saveHeroSlide, toggleHeroSlide, deleteHeroSlide,
        linesAccordion, saveLineAccordion,
        digitalCatalog, setDigitalCatalog,
        videoTips, saveVideoTip, toggleVideoTip, deleteVideoTip,
        resetRequests, createResetRequest, approveResetRequest, completeResetPassword,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig debe usarse dentro de ConfigProvider');
  return context;
};
