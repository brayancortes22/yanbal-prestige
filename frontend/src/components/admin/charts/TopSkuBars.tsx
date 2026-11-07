import React from 'react';
import { CHART_COLORS } from './chartTheme';

interface TopSkuBarsProps {
  items: { code: string; name: string; qty: number; pct: number }[];
}

/** Ranking de referencias con barras terracota→champagne (sin ámbar genérico). */
export const TopSkuBars: React.FC<TopSkuBarsProps> = ({ items }) => (
  <section className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
    <div>
      <span className="text-[10px] font-bold text-brand-apricot uppercase tracking-wider block">
        Demanda de producto
      </span>
      <h4 className="font-editorial text-base font-bold text-stone-900">Top 5 SKU más vendidos</h4>
    </div>

    {items.length === 0 ? (
      <p className="py-10 text-center text-xs text-stone-400">Sin órdenes registradas aún.</p>
    ) : (
      <div className="space-y-2.5 pt-4">
        {items.map((item, index) => (
          <div key={item.code} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-apricot-soft text-[9px] font-bold text-brand-apricot-dark">
                  {index + 1}
                </span>
                <span className="truncate font-semibold text-stone-800">{item.name}</span>
              </span>
              <span className="shrink-0 font-mono font-bold text-stone-500">{item.qty} uds</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.pct}%`,
                  background: `linear-gradient(90deg, ${CHART_COLORS.apricot} 0%, ${CHART_COLORS.gold} 100%)`,
                }}
                role="progressbar"
                aria-valuenow={item.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.name}: ${item.qty} unidades`}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);
