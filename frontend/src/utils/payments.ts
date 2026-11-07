import type { Order, PaymentMethod, PaymentStatus } from '../types';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
  reembolso: 'Reembolso / devolución',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  abono: 'Con abono',
  pagado: 'Pagado',
  anulada: 'Anulada',
};

export const formatCop = (value: number): string =>
  `$${Math.round(value).toLocaleString('es-CO')}`;

/** Total abonado. Si el pedido es antiguo y no tiene historial, se infiere. */
export const getPaidAmount = (order: Order): number => {
  if (order.payments && order.payments.length > 0) {
    return order.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
  return order.paymentStatus === 'pagado' ? order.totalAmount : 0;
};

/** Saldo pendiente del pedido, nunca negativo. */
export const getBalance = (order: Order): number =>
  Math.max(0, order.totalAmount - getPaidAmount(order));

/** Estado coherente con el dinero realmente recibido. */
export const derivePaymentStatus = (total: number, paid: number): PaymentStatus => {
  if (paid <= 0) return 'pendiente';
  if (paid + 0.5 >= total) return 'pagado';
  return 'abono';
};

/** Resumen corto para tablas: "Abonado $50.000 · Saldo $139.000". */
export const getPaymentSummary = (order: Order): string => {
  const paid = getPaidAmount(order);
  const balance = getBalance(order);
  if (paid <= 0) return `Sin abono · Saldo ${formatCop(balance)}`;
  if (balance <= 0) return `Pagado ${formatCop(paid)}`;
  return `Abonado ${formatCop(paid)} · Saldo ${formatCop(balance)}`;
};
