import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Users, ShoppingBag, LogOut, ShieldCheck, Share2, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ConsultantNav: React.FC = () => {
  const { logout, username } = useAuth();

  const navItems = [
    { to: '/consultora', label: 'Mi Resumen & Metas', icon: Sparkles, end: true },
    { to: '/consultora/ventas', label: 'Mis Ventas & Pedidos', icon: Receipt },
    { to: '/consultora/clientes', label: 'Mis Clientas (CRM)', icon: Users },
    { to: '/consultora/catalogo', label: 'Catálogo Rápido SKU', icon: ShoppingBag },
  ];

  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hola, te comparto mi catálogo oficial Yanbal Prestige: ${window.location.origin}/catalogo`
  )}`;

  return (
    <>
      <div className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 border-b border-stone-100 py-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-apricot">
                  Portal de Consultora Independiente
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Activa Campaña 05</span>
                </span>
              </div>
              <h1 className="font-editorial text-xl font-bold text-stone-900 sm:text-2xl">
                Espacio de Ventas • {username || 'Carolina Mejía'}
              </h1>
              <p className="text-xs text-stone-500">
                Gestiona tus clientas frecuentes, pedidos, ventas directas y comparte tu catálogo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-brand-espresso px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-stone-800"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Compartir mi Catálogo</span>
              </a>

              <button
                onClick={logout}
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-30 border-b border-stone-200/80 bg-white/95 shadow-xs backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto py-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-brand-apricot text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};
