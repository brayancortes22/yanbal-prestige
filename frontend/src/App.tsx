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
import { JoinView } from './views/JoinView';
import { NotFoundView } from './views/NotFoundView';

// Autenticación & Cambio de Clave
import { AdminLoginView } from './views/admin/AdminLoginView';
import { ResetPasswordView } from './views/auth/ResetPasswordView';

// Páginas Centralizadas de Administración
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminCatalogView } from './views/admin/AdminCatalogView';
import { AdminContentCMSView } from './views/admin/AdminContentCMSView';
import { AdminAnnouncementsView } from './views/admin/AdminAnnouncementsView';
import { AdminUsersView } from './views/admin/AdminUsersView';
import { AdminLeadsView } from './views/admin/AdminLeadsView';

// Páginas Centralizadas de Consultora
import { ConsultantPortalView } from './views/consultant/ConsultantPortalView';
import { ConsultantClientsView } from './views/consultant/ConsultantClientsView';
import { ConsultantCatalogView } from './views/consultant/ConsultantCatalogView';

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
          <Route path="/unete" element={<JoinView />} />
          <Route path="/admin/login" element={<AdminLoginView />} />
          <Route path="/recuperar-clave" element={<ResetPasswordView />} />

          {/* Rutas Administrativas Centralizadas */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardView /></ProtectedRoute>} />
          <Route path="/admin/catalogo" element={<ProtectedRoute><AdminCatalogView /></ProtectedRoute>} />
          <Route path="/admin/contenido" element={<ProtectedRoute><AdminContentCMSView /></ProtectedRoute>} />
          <Route path="/admin/anuncios" element={<ProtectedRoute><AdminAnnouncementsView /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute><AdminUsersView /></ProtectedRoute>} />
          <Route path="/admin/prospectos" element={<ProtectedRoute><AdminLeadsView /></ProtectedRoute>} />

          {/* Rutas de Consultora Centralizadas */}
          <Route path="/consultora" element={<ProtectedRoute><ConsultantPortalView /></ProtectedRoute>} />
          <Route path="/consultora/clientes" element={<ProtectedRoute><ConsultantClientsView /></ProtectedRoute>} />
          <Route path="/consultora/catalogo" element={<ProtectedRoute><ConsultantCatalogView /></ProtectedRoute>} />

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
    <BrowserRouter>
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
