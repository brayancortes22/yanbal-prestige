import React from 'react';
import { PAYMENT_COLORS, formatCopCompact } from './chartTheme';

interface PaymentDonutProps {
  orders: { paymentStatus: 'pendiente' | 'abono' | 'pagado'; totalAmount: number }[];
}

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Dona de recaudo con paleta de marca. Antes usaba verde/ámbar/rojo puros
 * (semáforo) que chocaban con el resto del panel; ahora usa terracota, oro
 * champagne y arena cálida, manteniendo la lectura de negocio.
 */
export const PaymentDonut: React.FC<PaymentDonutProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const groups = (['pagado', 'abono', 'pendiente'] as const).map((status) => {
    const items = orders.filter((order) => order.paymentStatus === status);
    return {
      status,
      count: items.length,
      amount: items.reduce((sum, order) => sum + order.totalAmount, 0),
      pct: totalOrders === 0 ? 0 : Math.round((items.length / totalOrders) * 100),
    };
  });

  const collectedPct = groups[0].pct;
  const collectedAmount = groups[0].amount;
  let accumulated = 0;

  return (
    <section className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block">
          Flujo de caja
        </span>
        <h4 className="font-editorial text-base font-bold text-stone-900">Estado de recaudo</h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-3">
        <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`Cobrado ${collectedPct}%`}>
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="transparent"
              stroke="#F1ECE6"
              strokeWidth="12"
            />
            {totalOrders > 0 &&
              groups.map((group) => {
                const dash = (group.pct / 100) * CIRCUMFERENCE;
                const offset = -accumulated;
                accumulated += dash;
                return (
                  <circle
                    key={group.status}
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="transparent"
                    stroke={PAYMENT_COLORS[group.status]}
                    strokeWidth="12"
                    strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                    strokeDashoffset={offset}
                    className="transition-all duration-700"
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-stone-900">{collectedPct}%</span>
            <span className="text-[8px] uppercase tracking-wider font-semibold text-stone-400">
              Cobrado
            </span>
          </div>
        </div>

        <div className="w-full sm:w-auto space-y-2">
          {groups.map((group) => (
            <div key={group.status} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-stone-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PAYMENT_COLORS[group.status] }}
                />
                {group.status === 'pagado'
                  ? 'Pagado'
                  : group.status === 'abono'
                    ? 'Con abono'
                    : 'Pendiente'}
              </span>
              <span className="font-semibold text-stone-800">
                {group.count} · {formatCopCompact(group.amount)}
              </span>
            </div>
          ))}
          <p className="border-t border-stone-100 pt-2 text-[10px] text-stone-400">
            Recaudado: <strong className="text-stone-600">{formatCopCompact(collectedAmount)}</strong>
          </p>
        </div>
      </div>
    </section>
  );
};
