import React from 'react';
import { Wallet } from 'lucide-react';
import type { PaymentMethod, PaymentStatus } from '../../types';
import { PAYMENT_METHOD_LABELS, formatCop } from '../../utils/payments';

interface DirectSalePaymentFieldsProps {
  total: number;
  status: PaymentStatus;
  setStatus: (status: PaymentStatus) => void;
  amount: string;
  setAmount: (amount: string) => void;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  note: string;
  setNote: (note: string) => void;
}

const methods: PaymentMethod[] = [
  'efectivo',
  'transferencia',
  'nequi',
  'daviplata',
  'tarjeta',
  'otro',
];

const statuses: { value: PaymentStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'abono', label: 'Abono parcial' },
  { value: 'pagado', label: 'Pagado' },
];

/**
 * Bloque de cobro de la venta directa. Cuando se elige "abono" exige el
 * monto real entregado, para que la factura no pierda esa información.
 */
export const DirectSalePaymentFields: React.FC<DirectSalePaymentFieldsProps> = ({
  total,
  status,
  setStatus,
  amount,
  setAmount,
  method,
  setMethod,
  note,
  setNote,
}) => {
  const numericAmount = Math.min(Math.max(0, Number(amount) || 0), total);

  return (
    <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/60 p-3">
      <strong className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-500">
        <Wallet className="h-3.5 w-3.5 text-brand-apricot" /> Forma de pago
      </strong>

      <div className="grid grid-cols-3 gap-1.5">
        {statuses.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setStatus(option.value);
              if (option.value === 'pagado') setAmount(String(total));
              if (option.value === 'pendiente') setAmount('');
            }}
            className={`rounded-xl border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
              status === option.value
                ? 'border-brand-apricot bg-brand-apricot-soft text-brand-apricot-dark'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {status !== 'pendiente' && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="sale-payment-amount" className="mb-1 block text-[10px] font-semibold text-stone-600">
              {status === 'pagado' ? 'Monto recibido' : 'Monto del abono'} (COP)
            </label>
            <input
              id="sale-payment-amount"
              type="number"
              min="1"
              max={total}
              value={status === 'pagado' ? String(total) : amount}
              disabled={status === 'pagado'}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 font-mono text-xs font-bold text-stone-900 disabled:bg-stone-100"
            />
          </div>
          <div>
            <label htmlFor="sale-payment-method" className="mb-1 block text-[10px] font-semibold text-stone-600">
              Método
            </label>
            <select
              id="sale-payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              className="w-full rounded-xl border border-stone-200 bg-white px-2 py-2 text-xs"
            >
              {methods.map((item) => (
                <option key={item} value={item}>
                  {PAYMENT_METHOD_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {status === 'abono' && (
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[11px]">
          <span className="text-stone-500">Abono inicial</span>
          <strong className="text-emerald-700">{formatCop(numericAmount)}</strong>
          <span className="text-stone-400">Saldo {formatCop(total - numericAmount)}</span>
        </div>
      )}

      {status !== 'pendiente' && (
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Nota del pago (opcional): comprobante, acuerdo..."
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-[11px]"
        />
      )}
    </div>
  );
};
