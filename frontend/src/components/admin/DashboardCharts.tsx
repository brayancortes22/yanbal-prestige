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
  // Las facturas anuladas o canceladas no cuentan como ingreso ni como
  // unidades vendidas: se excluyen de toda la analítica.
  const activeOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.deliveryStatus !== 'cancelado' && order.paymentStatus !== 'anulada'
      ),
    [orders]
  );

  const topSkuList = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; code: string }> = {};
    activeOrders.forEach((order) => {
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
  }, [activeOrders]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <RevenueBars orders={activeOrders} />
      <PaymentDonut orders={activeOrders} />
      <TopSkuBars items={topSkuList} />
    </div>
  );
};
