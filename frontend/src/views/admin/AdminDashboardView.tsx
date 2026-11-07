import React from 'react';
import { Package, Users, DollarSign, MessageCircle } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { DashboardCharts } from '../../components/admin/DashboardCharts';
import { StatCard } from '../../components/admin/StatCard';
import { formatCop, formatCopCompact } from '../../components/admin/charts/chartTheme';
import { useConfig } from '../../context/ConfigContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardView: React.FC = () => {
  const { products, users, clients, orders } = useConfig();
  const { logout } = useAuth();

  useIdleTimer({
    timeoutMs: 15 * 60 * 1000,
    onIdle: () => logout(),
  });

  const validOrders = orders.filter(
    (o) => o.deliveryStatus !== 'cancelado' && o.paymentStatus !== 'anulada'
  );
  const totalSales = validOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const averageTicket = validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;
  const networkMembers = users.filter(
    (u) => u.role === 'CONSULTORA' && u.active
  ).length;
  const activeProducts = products.filter((p) => p.active !== false).length;

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute right-0 top-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-xl space-y-2 relative z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-gold">
              Resumen Ejecutivo • Campaña Activa
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold">
              Rendimiento Comercial de la Red
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Monitoreo en tiempo real de facturación, recaudos, consultoras activas y demanda de catálogo.
            </p>
          </div>
        </div>

        {/* Bento Grid KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            Icon={DollarSign}
            label="Ventas Registradas"
            value={formatCop(totalSales)}
            hint={validOrders.length > 0 ? `Ticket promedio ${formatCopCompact(averageTicket)}` : 'Sin facturas aún'}
            tone="apricot"
          />
          <StatCard
            Icon={MessageCircle}
            label="Órdenes Totales"
            value={`${validOrders.length} ${validOrders.length === 1 ? 'Factura' : 'Facturas'}`}
            hint="Despachos y ventas directas (sin anuladas)"
            tone="espresso"
          />
          <StatCard
            Icon={Users}
            label="Consultoras en la Red"
            value={`${networkMembers} Activas`}
            hint={`${clients.length} clientas en CRM`}
            tone="gold"
          />
          <StatCard
            Icon={Package}
            label="Catálogo Activo"
            value={`${activeProducts} Referencias`}
            hint="Con código SKU oficial"
            tone="sand"
          />
        </div>

        {/* Centro de Analítica & Gráficas SVG */}
        <DashboardCharts orders={orders} />
      </div>
    </div>
  );
};
