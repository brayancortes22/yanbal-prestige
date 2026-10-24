import React from 'react';
import { Package, Users, TrendingUp, DollarSign, MessageCircle, Star } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { useConfig } from '../../context/ConfigContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardView: React.FC = () => {
  const { products, users, clients } = useConfig();
  const { logout } = useAuth();

  // Auto-logout a los 15 minutos de inactividad
  useIdleTimer({
    timeoutMs: 15 * 60 * 1000,
    onIdle: () => logout(),
  });

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner de resumen de campaña */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl space-y-2 relative z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
              Resumen Ejecutivo • Campaña Activa
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
              Rendimiento Comercial de la Red
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Monitoreo en tiempo real de pedidos enviados a WhatsApp, cotizaciones de consultoras y actividad de clientes.
            </p>
          </div>
        </div>

        {/* Métricas clave en Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Ventas Estimadas Campaña</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">$4.850.000</h4>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3 inline" /> +18% vs Campaña 04
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Pedidos Vía WhatsApp</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">38 Cotizaciones</h4>
              <span className="text-[10px] text-stone-400">Generados desde el carrito</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Consultoras Activas</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">{users.length} Líderes</h4>
              <span className="text-[10px] text-stone-400">{clients.length} clientas en CRM</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Catálogo Activo</span>
              <h4 className="font-editorial text-2xl font-bold text-stone-900">{products.length} Referencias</h4>
              <span className="text-[10px] text-stone-400">Con código SKU oficial</span>
            </div>
          </div>
        </div>

        {/* Top 3 Productos de Mayor Salida */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Top 3 Productos Más Cotizados en Campaña 05</span>
            </h3>
            <span className="text-xs text-stone-500">Métricas consolidadas de la red</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
              <span className="text-[10px] font-bold text-orange-600 uppercase">1° Lugar • Cód. 2145</span>
              <h5 className="font-semibold text-xs text-stone-900">Total Block SPF 100</h5>
              <p className="text-[11px] text-stone-500">19 pedidos generados este ciclo.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
              <span className="text-[10px] font-bold text-orange-600 uppercase">2° Lugar • Cód. 1092</span>
              <h5 className="font-semibold text-xs text-stone-900">Extracto Divino Óleo</h5>
              <p className="text-[11px] text-stone-500">12 pedidos generados este ciclo.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
              <span className="text-[10px] font-bold text-orange-600 uppercase">3° Lugar • Cód. 3301</span>
              <h5 className="font-semibold text-xs text-stone-900">Perfume Ccori Cristal</h5>
              <p className="text-[11px] text-stone-500">7 pedidos generados este ciclo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
