import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Package, Megaphone, Users, UserCheck, LogOut, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminNav: React.FC = () => {
  const { logout, username } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Métricas & KPIs', icon: BarChart3, end: true },
    { to: '/admin/catalogo', label: 'Catálogo & SKU', icon: Package },
    { to: '/admin/contenido', label: 'Contenido CMS', icon: FileText },
    { to: '/admin/anuncios', label: 'Anuncios & Campaña', icon: Megaphone },
    { to: '/admin/usuarios', label: 'Equipo & Roles', icon: Users },
    { to: '/admin/prospectos', label: 'Prospectos Únete', icon: UserCheck },
  ];

  return (
    <div className="bg-white border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barra superior con saludo y botón de salida */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600">
                Panel Administrativo Centralizado
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Sesión Segura (Auto-Logout 15m)</span>
              </span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
              Yanbal Prestige • Gerencia de Red
            </h1>
            <p className="text-xs text-stone-500">
              Directora: <strong>{username || 'Yuli Cortés'}</strong> • Control del catálogo, avisos y equipo.
            </p>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2 rounded-xl border border-stone-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-stone-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Pestañas de navegación centralizadas */}
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
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

      </div>
    </div>
  );
};
