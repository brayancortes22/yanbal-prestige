import React, { useMemo, useState } from 'react';
import { X, Wallet, CheckCircle2, History, Pencil, Trash2, Plus } from 'lucide-react';
import type { Order, PaymentMethod, PaymentRecord } from '../../types';
import {
  PAYMENT_METHOD_LABELS,
  derivePaymentStatus,
  formatCop,
  getPaidAmount,
} from '../../utils/payments';
import { useConfirm } from '../ui/ConfirmProvider';
import { useToast } from '../ui/ToastProvider';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface RegisterPaymentModalProps {
  order: Order | null;
  onClose: () => void;
  onSave: (order: Order) => void;
}

const methods: PaymentMethod[] = [
  'efectivo',
  'transferencia',
  'nequi',
  'daviplata',
  'tarjeta',
  'otro',
  'reembolso',
];

/**
 * Registra y CORRIGE pagos/abonos. Antes solo se podía agregar: si alguien
 * marcaba "pagado" por error o escribía mal el monto, no había forma de
 * editarlo. Ahora cada movimiento se puede modificar o eliminar y el estado
 * del pedido se recalcula solo.
 */
export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = (props) =>
  props.order ? (
    <PaymentModalContent key={props.order.id} {...props} order={props.order} />
  ) : null;

const PaymentModalContent: React.FC<RegisterPaymentModalProps & { order: Order }> = ({
  order,
  onClose,
  onSave,
}) => {
  const confirm = useConfirm();
  const { notify } = useToast();
  useBodyScrollLock(true);

  const payments = order.payments || [];
  const paid = getPaidAmount(order);
  // Pedidos antiguos marcados "pagado" sin detalle: permiten registrar el
  // movimiento real para que la factura explique de dónde salió el dinero.
  const needsDetail = payments.length === 0 && order.paymentStatus === 'pagado';
  const basePaid = needsDetail ? 0 : paid;
  const balance = Math.max(0, order.totalAmount - basePaid);
  // Para mostrar: un pedido antiguo "pagado" sin movimientos se asume
  // cubierto por el total, aunque se le pueda registrar el detalle.
  const displayPaid = needsDetail ? order.totalAmount : basePaid;
  const displayBalance = Math.max(0, order.totalAmount - displayPaid);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState(needsDetail ? String(order.totalAmount) : balance > 0 ? String(balance) : '');
  const [method, setMethod] = useState<PaymentMethod>('nequi');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const editingPayment = payments.find((payment) => payment.id === editingId);
  const maxAmount =
    order.totalAmount - (basePaid - (editingPayment?.amount || 0));
  const maxRefund = Math.max(
    0,
    displayPaid + (editingPayment && editingPayment.amount < 0 ? -editingPayment.amount : 0)
  );
  const isRefundMode = method === 'reembolso';
  const availableAmount = isRefundMode ? maxRefund : maxAmount;

  const history = useMemo(
    () => [...payments].sort((a, b) => b.date.localeCompare(a.date)),
    [payments]
  );

  const startEdit = (payment: PaymentRecord) => {
    setEditingId(payment.id);
    setAmount(String(Math.abs(payment.amount)));
    setMethod(payment.method);
    setNote(payment.note || '');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount(balance > 0 ? String(balance) : '');
    setMethod('nequi');
    setNote('');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const input = Math.round(Number(amount));
    if (!Number.isFinite(input) || input <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }

    const refund = method === 'reembolso';
    if (input > availableAmount + 0.5) {
      setError(
        refund
          ? `La devolución supera el dinero recibido (${formatCop(availableAmount)}).`
          : `El monto supera el saldo disponible (${formatCop(availableAmount)}).`
      );
      return;
    }

    const value = refund ? -input : input;

    const accepted = await confirm({
      title: editingPayment
        ? '¿Guardar cambios del movimiento?'
        : refund
          ? '¿Registrar esta devolución?'
          : '¿Registrar este pago?',
      message: editingPayment
        ? `Se actualizará el movimiento a ${formatCop(value)} (${PAYMENT_METHOD_LABELS[method]}).`
        : refund
          ? `Se devolverán ${formatCop(input)} de la factura ${order.invoiceNumber}. El saldo se recalculará.`
          : `Se registrará un pago de ${formatCop(value)} por ${PAYMENT_METHOD_LABELS[method]} en la factura ${order.invoiceNumber}.`,
      confirmText: editingPayment ? 'Guardar cambios' : refund ? 'Sí, registrar devolución' : 'Sí, registrar pago',
    });
    if (!accepted) return;

    const record: PaymentRecord = {
      id: editingPayment?.id || `pay-${Date.now()}`,
      amount: value,
      method,
      note: note.trim() || undefined,
      date: editingPayment?.date || new Date().toISOString(),
    };

    const nextPayments = editingPayment
      ? payments.map((payment) => (payment.id === record.id ? record : payment))
      : [...payments, record];
    const nextPaid = nextPayments.reduce((sum, payment) => sum + payment.amount, 0);
    if (nextPaid < 0) {
      setError('Las devoluciones superan el dinero recibido en la factura.');
      return;
    }

    onSave({
      ...order,
      payments: nextPayments,
      paymentStatus:
        order.deliveryStatus === 'cancelado'
          ? 'anulada'
          : derivePaymentStatus(order.totalAmount, nextPaid),
      updatedAt: new Date().toISOString(),
    });
    notify(
      editingPayment
        ? `Movimiento actualizado a ${formatCop(value)}.`
        : refund
          ? `Devolución de ${formatCop(input)} registrada en ${order.invoiceNumber}.`
          : `Pago de ${formatCop(value)} registrado en ${order.invoiceNumber}.`
    );
    onClose();
  };

  const handleDelete = async (payment: PaymentRecord) => {
    const accepted = await confirm({
      title: '¿Eliminar este pago?',
      message: `Se quitará el movimiento de ${formatCop(payment.amount)}. El estado de la factura se recalculará automáticamente.`,
      confirmText: 'Sí, eliminar',
      tone: 'danger',
    });
    if (!accepted) return;

    const nextPayments = payments.filter((item) => item.id !== payment.id);
    const nextPaid = nextPayments.reduce((sum, item) => sum + item.amount, 0);
    onSave({
      ...order,
      payments: nextPayments,
      paymentStatus:
        order.deliveryStatus === 'cancelado'
          ? 'anulada'
          : derivePaymentStatus(order.totalAmount, nextPaid),
      updatedAt: new Date().toISOString(),
    });
    notify(`Pago de ${formatCop(payment.amount)} eliminado.`, 'info');
    if (editingId === payment.id) cancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand-apricot" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">Pagos y abonos</h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl p-1.5 text-stone-500 hover:bg-stone-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-slim space-y-4 overflow-y-auto p-5 text-xs">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Factura</span>
              <strong className="font-mono text-stone-900">{order.invoiceNumber}</strong>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-stone-500">Clienta</span>
              <strong className="text-stone-900">{order.clientName}</strong>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-200 pt-2 text-center">
              <div>
                <span className="block text-[10px] uppercase text-stone-400">Total</span>
                <strong className="block text-stone-900">{formatCop(order.totalAmount)}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-stone-400">
                  Pagado{needsDetail ? ' (inferido)' : ''}
                </span>
                <strong className="block text-emerald-700">{formatCop(displayPaid)}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-stone-400">Saldo</span>
                <strong className="block text-brand-apricot-dark">{formatCop(displayBalance)}</strong>
              </div>
            </div>
          </div>

          {displayBalance <= 0 && !editingId && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              <span>Factura pagada. Puedes corregir o eliminar los movimientos de abajo.</span>
            </div>
          )}

          {(maxAmount > 0.5 || maxRefund > 0.5 || editingPayment || needsDetail) && (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-stone-200 p-3">
              <div className="flex items-center justify-between">
                <strong className="text-[11px] uppercase tracking-wide text-stone-500">
                  {editingPayment
                    ? 'Editar movimiento'
                    : isRefundMode
                      ? 'Registrar devolución'
                      : needsDetail
                        ? 'Registrar detalle del pago'
                        : 'Nuevo pago o abono'}
                </strong>
                {editingPayment && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="cursor-pointer text-[10px] font-semibold text-stone-400 hover:text-stone-700"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="payment-amount" className="mb-1 block font-semibold text-stone-700">
                  Monto (COP)
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  min="1"
                  max={availableAmount}
                  required
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5 font-mono text-sm font-bold text-stone-900"
                />
                <div className="mt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAmount(String(Math.round(availableAmount)))}
                    className="rounded-full bg-brand-apricot-soft px-2 py-0.5 text-[10px] font-semibold text-brand-apricot-dark"
                  >
                    {isRefundMode ? 'Máximo a devolver' : 'Saldo disponible'} ({formatCop(availableAmount)})
                  </button>
                  {availableAmount > 1 && (
                    <button
                      type="button"
                      onClick={() => setAmount(String(Math.round(availableAmount / 2)))}
                      className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600"
                    >
                      50%
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor="payment-method" className="mb-1 block font-semibold text-stone-700">
                    Método
                  </label>
                  <select
                    id="payment-method"
                    value={method}
                    onChange={(event) => {
                      const next = event.target.value as PaymentMethod;
                      setMethod(next);
                      setAmount(
                        next === 'reembolso'
                          ? maxRefund > 0
                            ? String(Math.round(maxRefund))
                            : ''
                          : balance > 0
                            ? String(Math.round(balance))
                            : ''
                      );
                    }}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5"
                  >
                    {methods.map((item) => (
                      <option key={item} value={item}>
                        {PAYMENT_METHOD_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="payment-note" className="mb-1 block font-semibold text-stone-700">
                    Nota (opcional)
                  </label>
                  <input
                    id="payment-note"
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Comprobante, acuerdo..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-apricot py-2.5 font-semibold text-white transition-colors hover:bg-brand-apricot-dark"
              >
                {editingPayment ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingPayment ? 'Guardar cambios' : isRefundMode ? 'Registrar devolución' : 'Registrar pago'}
              </button>
            </form>
          )}

          {history.length > 0 && (
            <div className="space-y-2 border-t border-stone-100 pt-3">
              <strong className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-500">
                <History className="h-3.5 w-3.5" /> Historial de pagos
              </strong>
              <ul className="space-y-1.5">
                {history.map((payment) => (
                  <li
                    key={payment.id}
                    className={`flex items-start justify-between gap-2 rounded-xl border px-2.5 py-2 ${
                      editingId === payment.id
                        ? 'border-brand-apricot/40 bg-brand-apricot-soft/40'
                        : 'border-stone-100 bg-stone-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-stone-800">
                        {formatCop(payment.amount)} · {PAYMENT_METHOD_LABELS[payment.method]}
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        {new Date(payment.date).toLocaleString('es-CO')}
                        {payment.note ? ` · ${payment.note}` : ''}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(payment)}
                        className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-white hover:text-brand-apricot-dark"
                        title="Editar movimiento"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(payment)}
                        className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
