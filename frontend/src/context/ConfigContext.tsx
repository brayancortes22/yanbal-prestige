import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { 
  AnnouncementConfig, 
  AppUser, 
  ConsultantClient, 
  PasswordResetRequest, 
  Product,
  AboutContentConfig,
  JoinContentConfig,
  EventItem,
  HeroSlide,
  LineAccordionItem,
  DigitalCatalogConfig,
  VideoTipItem,
  TipItem,
  Order,
  PaymentStatus,
  DeliveryStatus,
  LegalDocs,
  LegalKind,
  LegalDocument,
  SiteFooterConfig
} from '../types';
import { initialOrders } from '../data/ordersData';
import { legalDefaults } from '../data/legalData';
import { 
  productsData, 
  eventsData, 
  heroSlidesData, 
  linesAccordionData, 
  digitalCatalogData, 
  videoTipsData 
} from '../data/catalogData';
import { tipsData } from '../data/tipsData';
import { useCacheSync } from '../hooks/useCacheSync';
import { api, isApiConfigured } from '../services/api';
import type { ApiClient, ApiUser } from '../services/apiMappers';
import {
  mapApiClient,
  mapApiOrder,
  mapApiProduct,
  mapApiUser,
  toApiClient,
  toApiCreateOrder,
  toApiPayments,
  toApiProduct,
  toApiUser,
} from '../services/apiMappers';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/ToastProvider';

const defaultFooter: SiteFooterConfig = {
  whatsappUrl: 'https://wa.me/573000000000',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  contactEmail: 'contacto@yanbalprestige.com',
  legalNote:
    'Este sitio web es propiedad y está administrado por Consultoras y Directoras Independientes de Belleza Yanbal. No es el sitio web corporativo oficial de Yanbal International ni de Yanbal de Colombia S.A.S. Las marcas registradas, logotipos y productos son propiedad de Yanbal International.',
  updatedAt: new Date().toISOString(),
};

const defaultAnnouncements: AnnouncementConfig = {
  topBannerText: 'Campaña 05 Yanbal: Envíos gratis por compras superiores a $150.000 COP y asesoría dermocosmética sin costo.',
  topBannerActive: true,
  campaignName: 'Campaña 05 - Esencia & Cuidado',
  campaignDiscountText: 'Hasta 35% OFF en Línea Sentiva y Fragancias Ccori',
  whatsAppWelcomeMsg: 'Hola Directora Yuli, vi el catálogo Yanbal Prestige y deseo una asesoría personalizada.',
  updatedAt: new Date().toISOString(),
};

const defaultJoinContent: JoinContentConfig = {
  tag: 'Carrera de Emprendimiento & Liderazgo',
  title: 'Sé Parte de Nuestro Equipo',
  subtitle: 'Elige la modalidad que mejor se adapte a tus metas: vende de forma libre con rentabilidad inmediata o construye una carrera corporativa liderando tu propio grupo de consultoras.',
  consultantBadge: 'Emprendimiento Directo',
  consultantTitle: 'Consultora de Belleza Independiente',
  consultantDesc: 'Vende los productos emblemáticos de Yanbal con catálogo digital y físico. Administra tu tiempo y gana comisiones inmediatas.',
  consultantBenefits: [
    'Ganancias del 25% al 35% sobre cada referencia vendida.',
    'Kit de inicio bonificado con productos de alta rotación.',
    'Talleres gratuitos de automaquillaje y cuidado de la piel.',
    'Tienda virtual propia y pedidos directos a tu WhatsApp.'
  ],
  consultantButtonText: 'Quiero ser Consultora de Belleza',
  directorBadge: 'Carrera de Liderazgo',
  directorTitle: 'Directora Independiente & Líder',
  directorDesc: 'Forma, guía y empodera a tu propio equipo de consultoras. Escala a la cima corporativa con bonos de red e ingresos residuales.',
  directorBenefits: [
    'Bonificaciones por ventas grupales de toda tu red.',
    'Viajes de convención nacionales e internacionales.',
    'Auto 0 km en comodato y reconocimientos de prestigio.',
    'Mentoría ejecutiva personalizada con la Directora Yuli Cortés.'
  ],
  directorButtonText: 'Postularme para Líder / Directora',
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
    leaderId: 'usr-3',
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
  {
    id: 'usr-4',
    name: 'Paula Ríos',
    email: 'paula.rios@yanbalprestige.com',
    role: 'CONSULTORA',
    documentId: '1017888999',
    phone: '+57 312 555 7788',
    zone: 'Zona 15 - Envigado',
    active: true,
    leaderId: 'usr-3',
  },
  {
    id: 'usr-5',
    name: 'Diana Salazar',
    email: 'diana.salazar@yanbalprestige.com',
    role: 'CONSULTORA',
    documentId: '1122334455',
    phone: '+57 300 111 2233',
    zone: 'Zona 12 - Usaquén',
    active: true,
  },
  {
    id: 'usr-6',
    name: 'Laura Asistente',
    email: 'laura.asistente@yanbalprestige.com',
    role: 'ASISTENTE',
    documentId: '1033445566',
    phone: '+57 311 444 5566',
    zone: 'Zona 12 - Bogotá',
    active: true,
  },
];

const initialClients: ConsultantClient[] = [
  {
    id: 'cli-1',
    consultantId: 'usr-2',
    name: 'Camila Restrepo',
    phone: '+57 312 456 7890',
    skinType: 'Mixta',
    favoriteCategory: 'Tratamiento Facial',
    notes: 'Usa Suero Extracto Divino cada noche. Le encanta la textura no grasa.',
    lastContactDate: '2026-04-12',
  },
  {
    id: 'cli-2',
    consultantId: 'usr-2',
    name: 'Valentina Morales',
    phone: '+57 318 999 1122',
    skinType: 'Normal',
    favoriteCategory: 'Perfumería',
    notes: 'Fanática de Ccori Cristal. Comprar en fechas especiales o promociones.',
    lastContactDate: '2026-04-18',
  },
  {
    id: 'cli-3',
    consultantId: 'usr-4',
    name: 'Laura Cárdenas',
    phone: '+57 301 444 8899',
    skinType: 'Seca',
    favoriteCategory: 'Protección Solar',
    notes: 'Piel sensible al sol. Prefiere texturas ligeras y sin fragancia.',
    lastContactDate: '2026-04-20',
  },
  {
    id: 'cli-4',
    consultantId: 'usr-3',
    name: 'Sofía Betancur',
    phone: '+57 310 777 1122',
    skinType: 'Grasa',
    favoriteCategory: 'Maquillaje',
    notes: 'Clienta de la líder. Busca base de cobertura media para eventos.',
    lastContactDate: '2026-04-22',
  },
  {
    id: 'cli-5',
    consultantId: 'usr-5',
    name: 'Marcela Ospina',
    phone: '+57 317 222 3344',
    skinType: 'Sensible',
    favoriteCategory: 'Joyería Fina',
    notes: 'Prefiere joyería hipoalergénica. Aún sin líder asignado.',
    lastContactDate: '2026-04-25',
  },
];

interface ConfigContextType {
  announcements: AnnouncementConfig;
  setAnnouncements: (config: AnnouncementConfig) => void;
  aboutContent: AboutContentConfig;
  setAboutContent: (config: AboutContentConfig) => void;
  joinContent: JoinContentConfig;
  setJoinContent: (config: JoinContentConfig) => void;
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
  tips: TipItem[];
  saveTip: (tip: TipItem) => void;
  toggleTip: (id: string) => void;
  deleteTip: (id: string) => void;
  resetRequests: PasswordResetRequest[];
  createResetRequest: (email: string, docId: string) => PasswordResetRequest;
  approveResetRequest: (reqId: string) => void;
  completeResetPassword: (reqId: string) => void;
  orders: Order[];
  saveOrder: (order: Order) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, paymentStatus?: PaymentStatus, deliveryStatus?: DeliveryStatus) => void;
  assignOrder: (orderId: string, consultantId: string, consultantName: string) => void;
  bulkAddProducts: (newProducts: Product[]) => void;
  legalDocs: LegalDocs;
  saveLegalDoc: (kind: LegalKind, doc: LegalDocument) => void;
  footerConfig: SiteFooterConfig;
  setFooterConfig: (config: SiteFooterConfig) => void;
  /** true cuando VITE_API_URL apunta al backend y los datos vienen de MySQL. */
  apiMode: boolean;
  apiLoading: boolean;
  apiError: string;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiMode = isApiConfigured();
  const { token, isAuthenticated, role } = useAuth();
  const { notify } = useToast();
  const [apiLoading, setApiLoading] = useState(apiMode);
  const [apiError, setApiError] = useState('');
  const lastTokenRef = useRef<string | null>(null);

  // En modo API el estado nace vacío y se hidrata desde MySQL. Los seeds
  // locales solo se usan en modo demostración explícito.
  const prefix = apiMode ? 'api_' : '';
  const { data: announcements, updateData: setAnnouncements } = useCacheSync<AnnouncementConfig>('announcements_v2', defaultAnnouncements);
  const { data: aboutContent, updateData: setAboutContent } = useCacheSync<AboutContentConfig>('about_content_v2', defaultAbout);
  const { data: joinContent, updateData: setJoinContent } = useCacheSync<JoinContentConfig>('join_content_v1', defaultJoinContent);
  const { data: products, updateData: setProducts } = useCacheSync<Product[]>(`${prefix}products_v1`, apiMode ? [] : productsData);
  const { data: users, updateData: setUsers } = useCacheSync<AppUser[]>(`${prefix}users_v1`, apiMode ? [] : initialUsers);
  const { data: clients, updateData: setClients } = useCacheSync<ConsultantClient[]>(`${prefix}clients_v1`, apiMode ? [] : initialClients);
  const { data: events, updateData: setEvents } = useCacheSync<EventItem[]>('events_v3', eventsData);
  const { data: heroSlides, updateData: setHeroSlides } = useCacheSync<HeroSlide[]>('hero_slides_v1', heroSlidesData);
  const { data: linesAccordion, updateData: setLinesAccordion } = useCacheSync<LineAccordionItem[]>('lines_accordion_v1', linesAccordionData);
  const { data: digitalCatalog, updateData: setDigitalCatalog } = useCacheSync<DigitalCatalogConfig>('digital_catalog_v1', digitalCatalogData);
  const { data: videoTips, updateData: setVideoTips } = useCacheSync<VideoTipItem[]>('video_tips_v1', videoTipsData);
  const { data: tips, updateData: setTips } = useCacheSync<TipItem[]>('tips_v1', tipsData);
  const { data: resetRequests, updateData: setResetRequests } = useCacheSync<PasswordResetRequest[]>('reset_requests_v3', []);
  const { data: legalDocs, updateData: setLegalDocs } = useCacheSync<LegalDocs>('legal_docs_v1', legalDefaults);
  const { data: footerConfig, updateData: setFooterConfig } = useCacheSync<SiteFooterConfig>('footer_config_v1', defaultFooter);
  const { data: orders, updateData: setOrders } = useCacheSync<Order[]>(`${prefix}orders_v1`, apiMode ? [] : initialOrders);

  const reportApiError = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : 'Error de conexión con la API.';
    setApiError(message);
    notify(`${fallback}: ${message}`, 'error');
  };

  // Cache-first: pinta lo que ya está en localStorage y revalida en silencio.
  // No se recarga la página ni se vacía la pantalla mientras llega la API.
  useEffect(() => {
    if (!apiMode) return;
    let cancelled = false;

    const load = async (silent = false) => {
      if (!silent) setApiLoading(true);
      if (!silent) setApiError('');

      try {
        const remoteProducts = await api.getProducts();
        if (!cancelled && remoteProducts) {
          setProducts(remoteProducts.map(mapApiProduct));
        }

        if (!isAuthenticated) {
          if (!cancelled) {
            setUsers([]);
            setClients([]);
            setOrders([]);
          }
          return;
        }

        // El backend recorta la respuesta según el rol:
        // directora = toda la red, líder = su equipo, consultora = lo propio.
        let remoteUsers: ApiUser[] = [];
        try {
          remoteUsers = await api.getUsers();
        } catch {
          try {
            remoteUsers = [await api.getMe()];
          } catch {
            remoteUsers = [];
          }
        }

        let remoteClients: ApiClient[] = [];
        try {
          remoteClients = await api.getAllClients();
        } catch {
          try {
            remoteClients = await api.getClients();
          } catch {
            remoteClients = [];
          }
        }

        const remoteOrders = await api.getOrders();

        if (cancelled) return;
        setUsers(remoteUsers.map(mapApiUser));
        setClients(remoteClients.map(mapApiClient));
        setOrders(remoteOrders.map(mapApiOrder));
      } catch (error) {
        // En una revalidación silenciosa no se interrumpe al usuario; solo
        // se registra el error para diagnóstico.
        if (!cancelled && !silent) reportApiError(error, 'No se pudieron cargar los datos');
      } finally {
        if (!cancelled && !silent) setApiLoading(false);
      }
    };

    // Si cambia la cuenta (no en el primer montaje), limpia para no mezclar
    // datos de dos usuarios. En carga normal se conserva la caché.
    if (
      lastTokenRef.current &&
      token &&
      lastTokenRef.current !== token &&
      !cancelled
    ) {
      setUsers([]);
      setClients([]);
      setOrders([]);
    }
    lastTokenRef.current = token;

    void load(false);

    const revalidate = () => {
      if (document.visibilityState === 'visible') void load(true);
    };
    window.addEventListener('focus', revalidate);
    document.addEventListener('visibilitychange', revalidate);
    const interval = window.setInterval(() => void load(true), 120_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', revalidate);
      document.removeEventListener('visibilitychange', revalidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiMode, isAuthenticated, token, role]);

  const upsertOrder = (order: Order) =>
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);

  // Carga Masiva Catálogo
  const bulkAddProducts = (newProducts: Product[]) => {
    if (!apiMode) {
      setProducts((prev) => {
        const existingCodes = new Set(prev.map((p) => p.code.trim().toUpperCase()));
        const filtered = newProducts.filter(
          (p) => !existingCodes.has(p.code.trim().toUpperCase())
        );
        return [...filtered, ...prev];
      });
      return;
    }

    void Promise.all(newProducts.map((product) => api.saveProduct(toApiProduct(product))))
      .then((saved) => {
        setProducts((prev) => [...saved.map(mapApiProduct), ...prev]);
        notify(`${saved.length} referencias importadas desde la API.`, 'info');
      })
      .catch((error) => reportApiError(error, 'No se pudo importar el catálogo'));
  };

  // CRUD Pedidos & Ventas
  const saveOrder = async (order: Order): Promise<Order | null> => {
    if (!apiMode) {
      upsertOrder(order);
      return order;
    }

    const exists = orders.some((o) => o.id === order.id);
    try {
      const saved = exists
        ? await api.updateOrderPayments(order.id, toApiPayments(order.payments || []))
        : await api.createOrder(toApiCreateOrder(order));
      const mapped = mapApiOrder(saved);
      upsertOrder(mapped);
      return mapped;
    } catch (error) {
      reportApiError(error, 'No se pudo guardar el pedido');
      return null;
    }
  };

  const updateOrderStatus = (
    orderId: string,
    paymentStatus?: PaymentStatus,
    deliveryStatus?: DeliveryStatus
  ) => {
    if (!apiMode) {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          const nextDelivery = deliveryStatus ?? o.deliveryStatus;
          const paid =
            o.payments && o.payments.length > 0
              ? o.payments.reduce((sum, p) => sum + p.amount, 0)
              : o.paymentStatus === 'pagado'
                ? o.totalAmount
                : 0;
          const recalculated: PaymentStatus =
            paid <= 0 ? 'pendiente' : paid + 0.5 >= o.totalAmount ? 'pagado' : 'abono';
          return {
            ...o,
            paymentStatus:
              paymentStatus ??
              (nextDelivery === 'cancelado'
                ? 'anulada'
                : o.paymentStatus === 'anulada'
                  ? recalculated
                  : o.paymentStatus),
            deliveryStatus: nextDelivery,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      return;
    }

    // El estado de pago ya no se envía: el backend lo deriva de los abonos
    // y de la anulación.
    if (!deliveryStatus) return;
    void api
      .updateOrderStatus(orderId, { deliveryStatus })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== orderId) return o;
            const paid =
              o.payments && o.payments.length > 0
                ? o.payments.reduce((sum, p) => sum + p.amount, 0)
                : o.paymentStatus === 'pagado'
                  ? o.totalAmount
                  : 0;
            const derived =
              deliveryStatus === 'cancelado'
                ? 'anulada'
                : paid <= 0
                  ? 'pendiente'
                  : paid + 0.5 >= o.totalAmount
                    ? 'pagado'
                    : 'abono';
            return {
              ...o,
              deliveryStatus,
              paymentStatus: derived,
              updatedAt: new Date().toISOString(),
            };
          })
        );
      })
      .catch((error) => reportApiError(error, 'No se pudo actualizar la entrega'));
  };

  const assignOrder = (orderId: string, consultantId: string, consultantName: string) => {
    if (!apiMode) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, consultantId, consultantName, updatedAt: new Date().toISOString() }
            : o
        )
      );
      return;
    }

    void api
      .assignOrder(orderId, consultantId, consultantName)
      .then(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, consultantId, consultantName, updatedAt: new Date().toISOString() }
              : o
          )
        );
      })
      .catch((error) => reportApiError(error, 'No se pudo reasignar el pedido'));
  };

  // CRUD Catálogo
  const saveProduct = (prod: Product) => {
    if (!apiMode) {
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === prod.id);
        return exists ? prev.map((p) => (p.id === prod.id ? prod : p)) : [prod, ...prev];
      });
      return;
    }

    void api
      .saveProduct(toApiProduct(prod))
      .then((saved) => {
        const mapped = mapApiProduct(saved);
        setProducts((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
      })
      .catch((error) => reportApiError(error, 'No se pudo guardar el producto'));
  };

  const toggleProductActive = (id: string) => {
    if (!apiMode) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
      return;
    }
    void api
      .toggleProduct(id)
      .then(() =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
      )
      .catch((error) => reportApiError(error, 'No se pudo cambiar el estado del producto'));
  };

  const deleteProduct = (id: string) => {
    if (!apiMode) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    void api
      .deleteProduct(id)
      .then(() => setProducts((prev) => prev.filter((p) => p.id !== id)))
      .catch((error) => reportApiError(error, 'No se pudo eliminar el producto'));
  };

  // CRUD Usuarios
  const saveUser = (u: AppUser) => {
    if (!apiMode) {
      setUsers((prev) => {
        const exists = prev.some((item) => item.id === u.id);
        return exists ? prev.map((item) => (item.id === u.id ? u : item)) : [u, ...prev];
      });
      return;
    }

    void api
      .saveUser(toApiUser(u))
      .then((saved) => {
        const mapped = mapApiUser(saved);
        setUsers((prev) => [mapped, ...prev.filter((item) => item.id !== mapped.id)]);
      })
      .catch((error) => reportApiError(error, 'No se pudo guardar el integrante'));
  };

  const toggleUserActive = (id: string) => {
    if (!apiMode) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
      return;
    }
    void api
      .toggleUser(id)
      .then(() =>
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))
      )
      .catch((error) => reportApiError(error, 'No se pudo cambiar el estado del integrante'));
  };

  const deleteUser = (id: string) => {
    if (!apiMode) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return;
    }
    void api
      .deleteUser(id)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== id)))
      .catch((error) => reportApiError(error, 'No se pudo eliminar el integrante'));
  };

  // CRUD Clientas CRM
  const addClient = (c: Omit<ConsultantClient, 'id'>) => {
    const newClient: ConsultantClient = { ...c, id: `cli-${Date.now()}` };
    if (!apiMode) {
      setClients((prev) => [newClient, ...prev]);
      return;
    }
    void api
      .saveClient(toApiClient(newClient))
      .then((saved) => setClients((prev) => [mapApiClient(saved), ...prev]))
      .catch((error) => reportApiError(error, 'No se pudo guardar la clienta'));
  };

  const updateClient = (c: ConsultantClient) => {
    if (!apiMode) {
      setClients((prev) => prev.map((item) => (item.id === c.id ? c : item)));
      return;
    }
    void api
      .saveClient(toApiClient(c))
      .then((saved) => {
        const mapped = mapApiClient(saved);
        setClients((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
      })
      .catch((error) => reportApiError(error, 'No se pudo actualizar la clienta'));
  };

  const deleteClient = (id: string) => {
    if (!apiMode) {
      setClients((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    const client = clients.find((item) => item.id === id);
    if (!client?.consultantId) {
      notify('No se pudo identificar la consultora dueña de la ficha.', 'error');
      return;
    }
    void api
      .deleteClient(id, client.consultantId)
      .then(() => setClients((prev) => prev.filter((item) => item.id !== id)))
      .catch((error) => reportApiError(error, 'No se pudo eliminar la clienta'));
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

  // CRUD Tips & Consejos
  const saveLegalDoc = (kind: LegalKind, doc: LegalDocument) => {
    setLegalDocs((prev) => ({ ...prev, [kind]: doc }));
  };

  const saveTip = (tip: TipItem) => {
    setTips((prev) => {
      const exists = prev.some((t) => t.id === tip.id);
      const next = exists ? prev.map((t) => (t.id === tip.id ? tip : t)) : [tip, ...prev];
      return next.sort((a, b) => a.order - b.order);
    });
  };
  const toggleTip = (id: string) => {
    setTips((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };
  const deleteTip = (id: string) => {
    setTips((prev) => prev.filter((t) => t.id !== id));
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
        joinContent, setJoinContent,
        products, saveProduct, toggleProductActive, deleteProduct,
        users, saveUser, toggleUserActive, deleteUser,
        clients, addClient, updateClient, deleteClient,
        events, saveEvent, deleteEvent,
        heroSlides, saveHeroSlide, toggleHeroSlide, deleteHeroSlide,
        linesAccordion, saveLineAccordion,
        digitalCatalog, setDigitalCatalog,
        videoTips, saveVideoTip, toggleVideoTip, deleteVideoTip,
        tips, saveTip, toggleTip, deleteTip,
        resetRequests, createResetRequest, approveResetRequest, completeResetPassword,
        orders, saveOrder, updateOrderStatus, assignOrder, bulkAddProducts,
        legalDocs, saveLegalDoc, footerConfig, setFooterConfig,
        apiMode, apiLoading, apiError,
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
