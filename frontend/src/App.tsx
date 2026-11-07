import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Vistas Públicas
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { AboutView } from './views/AboutView';
import { EventsView } from './views/EventsView';
import { TipsView } from './views/TipsView';
import { TipDetailView } from './views/TipDetailView';
import { JoinView } from './views/JoinView';
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
import { ConsultantClientsView } from './views/consultant/ConsultantClientsView';
import { ConsultantCatalogView } from './views/consultant/ConsultantCatalogView';

const ADMIN_ROLES = ['DIRECTORA', 'LIDER_ZONA', 'SUPER_ADMIN'] as const;
const CONSULTANT_ROLES = ['CONSULTORA', 'DIRECTORA', 'LIDER_ZONA', 'SUPER_ADMIN'] as const;

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
          <Route path="/admin/login" element={<AdminLoginView />} />
          <Route path="/recuperar-clave" element={<ResetPasswordView />} />

          {/* Rutas Administrativas Centralizadas */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminDashboardView /></ProtectedRoute>} />
          <Route path="/admin/ventas" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminSalesView /></ProtectedRoute>} />
          <Route path="/admin/catalogo" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminCatalogView /></ProtectedRoute>} />
          <Route path="/admin/contenido" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminContentCMSView /></ProtectedRoute>} />
          <Route path="/admin/anuncios" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminAnnouncementsView /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminUsersView /></ProtectedRoute>} />
          <Route path="/admin/prospectos" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES]}><AdminLeadsView /></ProtectedRoute>} />

          {/* Rutas de Consultora Centralizadas */}
          <Route path="/consultora" element={<ProtectedRoute allowedRoles={[...CONSULTANT_ROLES]}><ConsultantPortalView /></ProtectedRoute>} />
          <Route path="/consultora/ventas" element={<ProtectedRoute allowedRoles={[...CONSULTANT_ROLES]}><ConsultantSalesView /></ProtectedRoute>} />
          <Route path="/consultora/clientes" element={<ProtectedRoute allowedRoles={[...CONSULTANT_ROLES]}><ConsultantClientsView /></ProtectedRoute>} />
          <Route path="/consultora/catalogo" element={<ProtectedRoute allowedRoles={[...CONSULTANT_ROLES]}><ConsultantCatalogView /></ProtectedRoute>} />

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
      <ConfigProvider>
        <AuthProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
