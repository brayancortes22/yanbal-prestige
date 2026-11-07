import React from 'react';
import { Users, ShoppingBag, TrendingUp, Award, Plus } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { LeaderTeamPanel } from '../../components/consultant/LeaderTeamPanel';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';

export const ConsultantPortalView: React.FC = () => {
  const { clients, products, users, orders } = useConfig();
  const { username, email, role } = useAuth();

  const currentUser =
    users.find((user) => user.email.toLowerCase() === (email || '').toLowerCase()) ||
    users.find((user) => user.name.toLowerCase() === (username || '').toLowerCase());
  const myClients = currentUser
    ? clients.filter((client) => client.consultantId === currentUser.id)
    : clients;
  const team = currentUser
    ? users.filter((user) => user.leaderId === currentUser.id && user.active)
    : [];

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner de Bienvenida y Meta de Campaña */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl space-y-2 relative z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
              Mi Espacio Yanbal • Campaña 05
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
              ¡Hola, {username || 'Carolina'}!
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              {role === 'LIDER_ZONA' ? (
                <>
                  Lideras un equipo de <strong>{team.length} consultoras</strong>. Revisa sus ventas,
                  abonos y saldos en el panel de equipo.
                </>
              ) : (
                <>
                  Tienes <strong>{myClients.length} clientas registradas</strong> en tu CRM personal.
                  Comparte tu catálogo oficial y asesora con códigos oficiales para ganar el bono de campaña.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Tarjetas de Métricas de la Consultora */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Clientas en mi CRM</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">{myClients.length} Fichas</h4>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 inline" /> Contacto al día
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Catálogo Activo</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">{products.length} Referencias</h4>
              <span className="text-[10px] text-stone-400">Precios oficiales en COP</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Nivel de Descuento</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">30% Margen</h4>
              <span className="text-[10px] text-stone-400">Escala a 35% con $1.2M</span>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas: primero, para que el líder no tenga que bajar
            cien filas de equipo para registrar una venta. */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-editorial text-lg font-bold text-stone-900">
            Herramientas Rápidas de Venta
          </h3>
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
            <a
              href="/consultora/clientes"
              className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="block text-stone-900 text-sm">Gestionar Mis Clientas (CRM)</strong>
                <span className="text-stone-500">Revisar tipos de piel y mandar recomendaciones por WhatsApp.</span>
              </div>
              <Users className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="/consultora/catalogo"
              className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="block text-stone-900 text-sm">Consultar Códigos SKU</strong>
                <span className="text-stone-500">Buscador instantáneo para llamadas o pedidos rápidos.</span>
              </div>
              <ShoppingBag className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="/consultora/ventas/nueva"
              className="p-4 rounded-2xl bg-brand-apricot-soft/60 hover:bg-brand-apricot-soft border border-brand-apricot/25 transition-all flex items-center justify-between group"
            >
              <div>
                <strong className="block text-stone-900 text-sm">Registrar venta directa</strong>
                <span className="text-stone-500">Catálogo con fotos, carrito y pago en una sola página.</span>
              </div>
              <Plus className="w-5 h-5 text-brand-apricot group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {role === 'LIDER_ZONA' && currentUser && (
          <LeaderTeamPanel
            leader={currentUser}
            team={team}
            orders={orders}
            clients={clients}
          />
        )}

      </div>
    </div>
  );
};
