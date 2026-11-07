import React from 'react';
import { TrendingUp } from 'lucide-react';
import { CHART_COLORS, buildMonthlyRevenue, formatCop, formatCopCompact } from './chartTheme';

interface RevenueBarsProps {
  orders: { createdAt: string; totalAmount: number }[];
}

/**
 * Barras de ingresos por mes. Los datos salen de las órdenes reales:
 * antes la gráfica mostraba campañas inventadas (C01…C05) que nunca
 * cambiaban, lo que hacía que el panel mintiera sobre las ventas.
 */
export const RevenueBars: React.FC<RevenueBarsProps> = ({ orders }) => {
  const months = buildMonthlyRevenue(orders);
  const maxValue = Math.max(...months.map((month) => month.total), 1);
  const currentIndex = months.length - 1;
  const total = months.reduce((sum, month) => sum + month.total, 0);

  return (
    <section className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-brand-apricot uppercase tracking-wider block">
            Crecimiento comercial
          </span>
          <h4 className="font-editorial text-base font-bold text-stone-900">Ventas por mes (COP)</h4>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-apricot-soft px-2.5 py-1 text-[10px] font-bold text-brand-apricot-dark">
          <TrendingUp className="w-3 h-3" />
          {formatCopCompact(total)}
        </span>
      </div>

      {total === 0 ? (
        <p className="py-14 text-center text-xs text-stone-400">
          Aún no hay ventas registradas en los últimos 5 meses.
        </p>
      ) : (
        <div className="pt-6">
          <div className="h-40 flex items-end justify-between gap-3">
            {months.map((month, index) => {
              const height = Math.max(8, Math.round((month.total / maxValue) * 132));
              const isCurrent = index === currentIndex;
              return (
                <div
                  key={month.key}
                  className="group flex-1 flex h-full flex-col items-center justify-end gap-1.5"
                  title={`${month.label}: ${formatCop(month.total)}`}
                >
                  <span className="text-[9px] font-bold text-stone-500 opacity-0 transition-opacity group-hover:opacity-100">
                    {formatCopCompact(month.total)}
                  </span>
                  <div
                    style={{
                      height: `${height}px`,
                      background: isCurrent
                        ? `linear-gradient(180deg, ${CHART_COLORS.apricot} 0%, ${CHART_COLORS.apricotDark} 100%)`
                        : 'rgba(232, 93, 54, 0.34)',
                    }}
                    className="w-full max-w-[30px] rounded-t-xl transition-all duration-500 group-hover:brightness-105"
                    role="img"
                    aria-label={`${month.label}: ${formatCop(month.total)}`}
                  />
                  <span
                    className={`text-[10px] font-bold ${
                      isCurrent ? 'text-brand-apricot-dark' : 'text-stone-500'
                    }`}
                  >
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-stone-100 pt-3 text-[10px] text-stone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-apricot" />
            Mes en curso
          </div>
        </div>
      )}
    </section>
  );
};
