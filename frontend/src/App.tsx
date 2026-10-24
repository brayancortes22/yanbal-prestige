import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { AboutView } from './views/AboutView';
import { EventsView } from './views/EventsView';
import { JoinView } from './views/JoinView';
import { AdminLoginView } from './views/admin/AdminLoginView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { NotFoundView } from './views/NotFoundView';

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
          <Route path="/quienes-somos" element={<AboutView />} />
          <Route path="/eventos" element={<EventsView />} />
          <Route path="/unete" element={<JoinView />} />
          <Route path="/admin/login" element={<AdminLoginView />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardView />
              </ProtectedRoute>
            }
          />
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
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
