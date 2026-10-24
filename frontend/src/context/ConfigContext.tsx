import React, { createContext, useContext } from 'react';
import type { AnnouncementConfig, AppUser, ConsultantClient, PasswordResetRequest, Product } from '../types';
import { productsData } from '../data/catalogData';
import { useCacheSync } from '../hooks/useCacheSync';

const defaultAnnouncements: AnnouncementConfig = {
  topBannerText: 'Campaña 05 Yanbal: Envíos gratis por compras superiores a $150.000 COP y asesoría dermocosmética sin costo.',
  topBannerActive: true,
  campaignName: 'Campaña 05 - Esencia & Cuidado',
  campaignDiscountText: 'Hasta 35% OFF en Línea Sentiva y Fragancias Ccori',
  whatsAppWelcomeMsg: 'Hola Directora Yuli, vi el catálogo Yanbal Prestige y deseo una asesoría personalizada.',
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
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>> | ((prods: Product[]) => void);
  users: AppUser[];
  clients: ConsultantClient[];
  addClient: (c: Omit<ConsultantClient, 'id'>) => void;
  deleteClient: (id: string) => void;
  resetRequests: PasswordResetRequest[];
  createResetRequest: (email: string, docId: string) => PasswordResetRequest;
  approveResetRequest: (reqId: string) => void;
  completeResetPassword: (reqId: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: announcements, updateData: setAnnouncements } = useCacheSync<AnnouncementConfig>(
    'announcements_v1',
    defaultAnnouncements
  );

  const { data: products, updateData: setProducts } = useCacheSync<Product[]>(
    'products_v1',
    productsData
  );

  const { data: users } = useCacheSync<AppUser[]>('users_v1', initialUsers);

  const { data: clients, updateData: setClients } = useCacheSync<ConsultantClient[]>(
    'clients_v1',
    initialClients
  );

  const { data: resetRequests, updateData: setResetRequests } = useCacheSync<PasswordResetRequest[]>(
    'reset_requests_v1',
    []
  );

  const addClient = (c: Omit<ConsultantClient, 'id'>) => {
    const newClient: ConsultantClient = { ...c, id: `cli-${Date.now()}` };
    setClients((prev) => [newClient, ...prev]);
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((item) => item.id !== id));
  };

  const createResetRequest = (email: string, docId: string): PasswordResetRequest => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newReq: PasswordResetRequest = {
      id: `req-${Date.now()}`,
      userEmail: email,
      userName: user ? user.name : 'Consultora Yanbal',
      pinCode: randomPin,
      documentId: docId,
      status: user && user.documentId === docId ? 'approved' : 'pending', // Auto-aprobado si coincide la cédula
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
    setResetRequests((prev) => [newReq, ...prev]);
    return newReq;
  };

  const approveResetRequest = (reqId: string) => {
    setResetRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'approved' } : r))
    );
  };

  const completeResetPassword = (reqId: string) => {
    setResetRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'completed' } : r))
    );
  };

  return (
    <ConfigContext.Provider
      value={{
        announcements,
        setAnnouncements,
        products,
        setProducts,
        users,
        clients,
        addClient,
        deleteClient,
        resetRequests,
        createResetRequest,
        approveResetRequest,
        completeResetPassword,
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
