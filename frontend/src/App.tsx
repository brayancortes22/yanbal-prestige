import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/ui/ToastProvider';
import { ConfirmProvider } from './components/ui/ConfirmProvider';

// Vistas Públicas
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { AboutView } from './views/AboutView';
import { EventsView } from './views/EventsView';
import { TipsView } from './views/TipsView';
import { TipDetailView } from './views/TipDetailView';
import { JoinView } from './views/JoinView';
import { LegalView } from './views/LegalView';
import { NotFoundView } from './views/NotFoundView';

// Autenticación & Cambio de Clave
import { AdminLoginView } from './views/admin/AdminLoginView';
import { ResetPasswordView } from './views/auth/ResetPasswordView';

// Páginas Centralizadas de Administración
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminSalesView } from './views/admin/AdminSalesView';
import { AdminCatalogView } from './views/admin/AdminCatalogView';
import { AdminContentCMSView } from './views/admin/AdminContentCMSView';
import { AdminAnnouncementsView } from './views/admin/AdminAnnouncementsView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AdminLeadsView } from './views/admin/AdminLeadsView';

// Páginas Centralizadas de Consultora
import { ConsultantPortalView } from './views/consultant/ConsultantPortalView';
import { ConsultantSalesView } from './views/consultant/ConsultantSalesView';
import { NewSaleView } from './views/consultant/NewSaleView';
import { ConsultantClientsView } from './views/consultant/ConsultantClientsView';
import { ConsultantCatalogView } from './views/consultant/ConsultantCatalogView';

// Jerarquía de la red:
//  - Administradora/Directora: control total (catálogo, CMS, usuarios, red).
//  - Asistente administrativa: ayuda con catálogo, CMS, anuncios, prospectos
//    y ventas; NO puede gestionar usuarios ni roles.
//  - Líder de zona: vende igual que una consultora y además tiene
//    trabajadoras a cargo. No administra el CMS ni los usuarios.
//  - Consultora: vende y gestiona su propia cartera.
const ADMIN_ROLES = ['DIRECTORA', 'ASISTENTE', 'SUPER_ADMIN'] as const;
const OWNER_ROLES = ['DIRECTORA', 'SUPER_ADMIN'] as const;
const SALES_ROLES = ['CONSULTORA', 'LIDER_ZONA', 'DIRECTORA', 'ASISTENTE', 'SUPER_ADMIN'] as const;

export const AppLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream selection:bg-orange-100 selection:text-orange-900">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route
            path="/catalogo"
            element={<CatalogView searchQuery={searchQuery} onSearchChange={setSearchQuery} />}
          />
          <Route path="/producto/:id" element={<ProductDetailView />} />
          <Route path="/quienes-somos" element={<AboutView />} />
          <Route path="/eventos" element={<EventsView />} />
          <Route path="/tips" element={<TipsView />} />
          <Route path="/tips/:id" element={<TipDetailView />} />
          <Route path="/unete" element={<JoinView />} />
          <Route path="/terminos" element={<LegalView kind="terminos" />} />
          <Route path="/privacidad" element={<LegalView kind="privacidad" />} />
          <Route path="/cookies" element={<LegalView kind="cookies" />} />
          <Route path="/devoluciones" element={<LegalView kind="devoluciones" />} />
          <Route path="/admin/login" element={<AdminLoginView />} />
          <Route path="/recuperar-clave" element={<ResetPasswordView />} />

          {/* Rutas Administrativas Centralizadas */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminDashboardView /></ProtectedRoute>} />
          <Route path="/admin/ventas" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminSalesView /></ProtectedRoute>} />
          <Route path="/admin/catalogo" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminCatalogView /></ProtectedRoute>} />
          <Route path="/admin/contenido" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminContentCMSView /></ProtectedRoute>} />
          <Route path="/admin/anuncios" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminAnnouncementsView /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={[...OWNER_ROLES]}><AdminUsersView /></ProtectedRoute>} />
          <Route path="/admin/prospectos" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminLeadsView /></ProtectedRoute>} />

          {/* Portal de ventas: consultoras y líderes (el líder también vende). */}
          <Route path="/consultora" element={<ProtectedRoute allowedRoles={[...SALES_ROLES]}><ConsultantPortalView /></ProtectedRoute>} />
          <Route path="/consultora/ventas" element={<ProtectedRoute allowedRoles={[...SALES_ROLES]}><ConsultantSalesView /></ProtectedRoute>} />
          <Route path="/consultora/ventas/nueva" element={<ProtectedRoute allowedRoles={[...SALES_ROLES]}><NewSaleView /></ProtectedRoute>} />
          <Route path="/consultora/clientes" element={<ProtectedRoute allowedRoles={[...SALES_ROLES]}><ConsultantClientsView /></ProtectedRoute>} />
          <Route path="/consultora/catalogo" element={<ProtectedRoute allowedRoles={[...SALES_ROLES]}><ConsultantCatalogView /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
};

export default function App() {
  return (
    // Flags de migración v7: eliminan los avisos de consola y dejan el
    // enrutamiento listo para la siguiente versión de React Router.
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <ConfigProvider>
              <CartProvider>
                <AppLayout />
              </CartProvider>
            </ConfigProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
