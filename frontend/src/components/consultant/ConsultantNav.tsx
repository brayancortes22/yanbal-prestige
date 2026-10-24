import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Users, ShoppingBag, LogOut, ShieldCheck, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ConsultantNav: React.FC = () => {
  const { logout, username } = useAuth();

  const navItems = [
    { to: '/consultora', label: 'Mi Resumen & Metas', icon: Sparkles, end: true },
    { to: '/consultora/clientes', label: 'Mis Clientas (CRM)', icon: Users },
    { to: '/consultora/catalogo', label: 'Catálogo Rápido SKU', icon: ShoppingBag },
  ];

  return (
    <div className="bg-white border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600">
                Portal de Consultora Independiente
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Activa Campaña 05</span>
              </span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
              Espacio de Ventas • {username || 'Carolina Mejía'}
            </h1>
            <p className="text-xs text-stone-500">
              Gestiona tus clientas frecuentes, asesora con códigos oficiales y comparte tu catálogo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/?text=Hola%2C%20te%20comparto%20mi%20cat%C3%A1logo%20oficial%20Yanbal%20Prestige%3A%20http%3A%2F%2Flocalhost%3A5173%2Fcatalogo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir mi Catálogo</span>
            </a>

            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-stone-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
