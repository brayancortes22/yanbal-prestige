import React from 'react';
import { Eye, Wallet, Ban, RotateCcw } from 'lucide-react';
import type { Order, DeliveryStatus, AppUser } from '../../types';
import {
  PAYMENT_STATUS_LABELS,
  formatCop,
  getBalance,
  getPaidAmount,
} from '../../utils/payments';

interface AdminSalesRowProps {
  order: Order;
  consultants: AppUser[];
  onAssign: (ord: Order, consultantId: string) => void;
  onUpdateStatus: (id: string, deliveryStatus: DeliveryStatus) => void;
  onCancel: (ord: Order) => void;
  onReactivate: (ord: Order) => void;
  onSelectOrder: (ord: Order) => void;
  onPaymentOrder: (ord: Order) => void;
}

export const AdminSalesRow: React.FC<AdminSalesRowProps> = ({
  order: ord,
  consultants,
  onAssign,
  onUpdateStatus,
  onCancel,
  onReactivate,
  onSelectOrder,
  onPaymentOrder,
}) => {
  return (
    <tr className="hover:bg-stone-50/50 transition-colors">
      <td className="py-3 px-4 font-mono font-bold text-stone-800">{ord.invoiceNumber}</td>
      <td className="py-3 px-4">
        <p className="font-semibold text-stone-900">{ord.clientName}</p>
        <p className="text-[11px] text-stone-400">{ord.clientPhone}</p>
      </td>
      <td className="py-3 px-4">
        <select
          value={ord.consultantId}
          onChange={(e) => void onAssign(ord, e.target.value)}
          className="p-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-medium max-w-[180px] truncate"
        >
          {!consultants.some((c) => c.id === ord.consultantId) && (
            <option value={ord.consultantId}>{ord.consultantName}</option>
          )}
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.replace(/\s*\([^)]*\)\s*$/, '')}
              {c.role === 'LIDER_ZONA' ? ' · Líder' : ' · Consultora'}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 px-4 font-bold text-stone-900">{formatCop(ord.totalAmount)}</td>
      <td className="py-3 px-4">
        <span className="block font-semibold text-emerald-700">
          {formatCop(getPaidAmount(ord))}
        </span>
        <span className="text-[10px] text-stone-400">
          Saldo {formatCop(getBalance(ord))}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col items-start gap-1">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              ord.paymentStatus === 'pagado'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : ord.paymentStatus === 'anulada'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : ord.paymentStatus === 'abono'
                    ? 'border-brand-gold/40 bg-[#FBF3D9] text-[#8A6D12]'
                    : 'border-stone-200 bg-stone-50 text-stone-600'
            }`}
          >
            {PAYMENT_STATUS_LABELS[ord.paymentStatus]}
          </span>
          <button
            type="button"
            onClick={() => onPaymentOrder(ord)}
            className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-brand-apricot hover:underline"
          >
            <Wallet className="h-3 w-3" />
            {ord.deliveryStatus === 'cancelado'
              ? 'Registrar devolución'
              : getBalance(ord) > 0
                ? 'Registrar abono'
                : 'Editar pagos'}
          </button>
        </div>
      </td>
      <td className="py-3 px-4">
        {ord.deliveryStatus === 'cancelado' ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            <Ban className="h-3 w-3" /> Cancelado
          </span>
        ) : (
          <select
            value={ord.deliveryStatus}
            onChange={(e) => onUpdateStatus(ord.id, e.target.value as DeliveryStatus)}
            className={`p-1.5 text-[11px] rounded-lg font-semibold border ${
              ord.deliveryStatus === 'entregado'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            <option value="preparacion">Preparación</option>
            <option value="camino">En Camino</option>
            <option value="entregado">Entregado</option>
          </select>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button
            onClick={() => onSelectOrder(ord)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-orange-50 hover:text-orange-600 text-stone-600 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Factura</span>
          </button>
          {ord.deliveryStatus === 'cancelado' ? (
            <button
              onClick={() => void onReactivate(ord)}
              className="px-2 py-1.5 rounded-xl border border-stone-200 text-stone-600 text-[11px] font-medium inline-flex items-center gap-1 hover:bg-stone-50 cursor-pointer"
              title="Reactivar factura"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reactivar</span>
            </button>
          ) : (
            <button
              onClick={() => void onCancel(ord)}
              className="px-2 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-[11px] font-medium inline-flex items-center gap-1 hover:bg-rose-50 cursor-pointer"
              title="Anular factura"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Anular</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
