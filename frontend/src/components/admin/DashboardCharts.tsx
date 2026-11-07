import React, { useMemo } from 'react';
import type { Order } from '../../types';
import { RevenueBars } from './charts/RevenueBars';
import { PaymentDonut } from './charts/PaymentDonut';
import { TopSkuBars } from './charts/TopSkuBars';

interface DashboardChartsProps {
  orders: Order[];
}

/**
 * Centro de analítica del panel. Cada visualización vive en su propio
 * componente y comparte la paleta de marca definida en `chartTheme.ts`.
 */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({ orders }) => {
  const topSkuList = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; code: string }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!counts[item.productCode]) {
          counts[item.productCode] = {
            name: item.productName,
            qty: 0,
            code: item.productCode,
          };
        }
        counts[item.productCode].qty += item.quantity;
      });
    });

    const sorted = Object.values(counts).sort((a, b) => b.qty - a.qty);
    const maxQty = sorted[0]?.qty || 1;
    return sorted
      .slice(0, 5)
      .map((item) => ({ ...item, pct: Math.round((item.qty / maxQty) * 100) }));
  }, [orders]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <RevenueBars orders={orders} />
      <PaymentDonut orders={orders} />
      <TopSkuBars items={topSkuList} />
    </div>
  );
};
