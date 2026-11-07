import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Package, Megaphone, Users, UserCheck, LogOut, ShieldCheck, FileText, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';

const LEADERSHIP = ['DIRECTORA', 'SUPER_ADMIN'];
// La asistente ayuda con catálogo, CMS, anuncios, prospectos y ventas.
// Equipo & Roles queda reservado a la administradora.
const CONTENT_ROLES = ['DIRECTORA', 'ASISTENTE', 'SUPER_ADMIN'];
const TEAM_VIEW = ['DIRECTORA', 'ASISTENTE', 'SUPER_ADMIN'];

export const AdminNav: React.FC = () => {
  const { logout, username, role } = useAuth();
  const { apiMode, apiLoading } = useConfig();

  const navItems = [
    { to: '/admin', label: 'Métricas & KPIs', icon: BarChart3, end: true, roles: TEAM_VIEW },
    { to: '/admin/ventas', label: 'Ventas & Facturas', icon: ShoppingBag, roles: TEAM_VIEW },
    { to: '/admin/catalogo', label: 'Catálogo & SKU', icon: Package, roles: TEAM_VIEW },
    { to: '/admin/contenido', label: 'Contenido CMS', icon: FileText, roles: CONTENT_ROLES },
    { to: '/admin/anuncios', label: 'Anuncios & Campaña', icon: Megaphone, roles: CONTENT_ROLES },
    { to: '/admin/usuarios', label: 'Equipo & Roles', icon: Users, roles: LEADERSHIP },
    { to: '/admin/prospectos', label: 'Prospectos Únete', icon: UserCheck, roles: CONTENT_ROLES },
  ].filter((item) => !role || item.roles.includes(role));

  const roleLabel =
    role === 'ASISTENTE'
      ? 'Asistente administrativa'
      : role === 'LIDER_ZONA'
        ? 'Líder de zona'
        : role === 'DIRECTORA'
          ? 'Administradora'
          : 'Invitada';

  // La cabecera institucional queda estática y solo la barra de pestañas se
  // pega bajo el header fijo (h-20). Antes todo el bloque se anclaba a
  // top-0 y quedaba oculto detrás del header del sitio.
  return (
    <>
      <div className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 border-b border-stone-100 py-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-apricot">
                  Panel Administrativo Centralizado
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Sesión Segura (Auto-Logout 15m)</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    apiMode
                      ? 'border-sky-200 bg-sky-50 text-sky-700'
                      : 'border-amber-200 bg-amber-50 text-amber-800'
                  }`}
                  title={
                    apiMode
                      ? 'Los datos se leen y escriben en MySQL mediante la API'
                      : 'Datos locales de demostración: configura VITE_API_URL'
                  }
                >
                  {apiMode ? 'MySQL · API' : 'Demo local'}
                  {apiMode && apiLoading && (
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  )}
                </span>
              </div>
              <h1 className="font-editorial text-xl font-bold text-stone-900 sm:text-2xl">
                Yanbal Prestige • Gerencia de Red
              </h1>
              <p className="text-xs text-stone-500">
                {roleLabel}: <strong>{username || 'Yuli Cortés'}</strong> • Control del catálogo, avisos y equipo.
              </p>
            </div>

            <button
              onClick={logout}
              className="flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600 sm:self-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
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
                        ? 'bg-brand-apricot text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
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
