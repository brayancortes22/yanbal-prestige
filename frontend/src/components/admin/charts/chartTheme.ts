/**
 * Paleta única de analítica para el panel administrativo.
 * Deriva de los tokens de marca (terracota, champagne y espresso) para que
 * las gráficas dejen de parecer un semáforo y hablen el mismo idioma visual
 * del catálogo y las tarjetas de captación.
 */
export const CHART_COLORS = {
  apricot: '#E85D36',
  apricotDark: '#C94A27',
  apricotSoft: '#F4B39D',
  gold: '#C9A227',
  goldSoft: '#E8D48B',
  emerald: '#2F6B4F',
  taupe: '#D8CFC4',
  ink: '#1C1917',
  muted: '#78716C',
  grid: '#EFE9E1',
} as const;

/**
 * Recaudo en la misma familia cálida de la marca: terracota para lo
 * cobrado, oro champagne para el abono y arena para lo pendiente.
 * Se elimina el verde de semáforo sin perder la jerarquía de lectura.
 */
export const PAYMENT_COLORS = {
  pagado: CHART_COLORS.apricotDark,
  abono: CHART_COLORS.gold,
  pendiente: CHART_COLORS.taupe,
} as const;

export const formatCop = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const formatCopCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return formatCop(value);
};

/** Etiqueta corta en español para el eje de campañas/meses. */
export const monthLabel = (date: Date): string =>
  date
    .toLocaleDateString('es-CO', { month: 'short' })
    .replace('.', '')
    .replace(/^./, (c) => c.toUpperCase());

/** Construye los últimos `count` meses (incluido el actual) con total vendido. */
export function buildMonthlyRevenue(
  orders: { createdAt: string; totalAmount: number }[],
  count = 5
): { key: string; label: string; total: number }[] {
  const now = new Date();
  const buckets = Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: monthLabel(date),
      total: 0,
    };
  });

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.find((item) => item.key === key);
    if (bucket) bucket.total += order.totalAmount;
  });

  return buckets;
}
