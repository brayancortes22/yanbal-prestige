import React from 'react';
import { X, Printer, Share2, Sparkles, History, Mail } from 'lucide-react';
import type { Order } from '../../types';
import {
  PAYMENT_METHOD_LABELS,
  formatCop,
  getBalance,
  getPaidAmount,
} from '../../utils/payments';
import { printInvoice } from '../../utils/invoiceDocument';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  useBodyScrollLock(Boolean(order));

  if (!order) return null;

  const paid = getPaidAmount(order);
  const balance = getBalance(order);

  const handleShareWhatsApp = () => {
    const itemsList = order.items
      .map((it) => `• ${it.quantity}x ${it.productName} (${it.productCode}) - $${it.subtotal.toLocaleString('es-CO')}`)
      .join('\n');
    const paymentLine =
      balance <= 0
        ? `✅ *PAGADO:* ${formatCop(paid)} COP`
        : `💵 *Abonado:* ${formatCop(paid)} COP\n⏳ *Saldo pendiente:* ${formatCop(balance)} COP`;
    const msg = `👑 *YANBAL PRESTIGE - FACTURA OFICIAL*\n🧾 *N° Factura:* ${order.invoiceNumber}\n🗓️ *Fecha:* ${new Date(order.createdAt).toLocaleDateString('es-CO')}\n👩‍💼 *Consultora:* ${order.consultantName}\n👤 *Clienta:* ${order.clientName} (${order.clientPhone})\n📍 *Ciudad:* ${order.clientCity}${order.clientAddress ? ' - ' + order.clientAddress : ''}\n\n📦 *Detalle del Pedido:*\n${itemsList}\n\n💰 *TOTAL: ${formatCop(order.totalAmount)} COP*\n${paymentLine}\n🚚 *Estado Entrega:* ${order.deliveryStatus.toUpperCase()}\n\n¡Gracias por tu confianza en Yanbal Prestige! ✨`;
    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleEmailInvoice = () => {
    const itemsList = order.items
      .map((it) => `- ${it.quantity}x ${it.productName} (${it.productCode}): ${formatCop(it.subtotal)}`)
      .join('\n');
    const body = [
      `Factura ${order.invoiceNumber}`,
      `Fecha: ${new Date(order.createdAt).toLocaleDateString('es-CO')}`,
      `Clienta: ${order.clientName}`,
      `Consultora: ${order.consultantName}`,
      '',
      'Productos:',
      itemsList,
      '',
      `Total: ${formatCop(order.totalAmount)}`,
      `Abonado: ${formatCop(paid)}`,
      `Saldo: ${formatCop(balance)}`,
    ].join('\n');
    const subject = `Factura ${order.invoiceNumber} - Yanbal Prestige`;
    window.location.href = `mailto:${order.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 p-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Comprobante de Venta</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
              {order.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!printInvoice(order)) window.print();
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Abre una factura A4 limpia para imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Factura PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            {order.clientEmail && (
              <button
                onClick={handleEmailInvoice}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title={`Enviar la factura a ${order.clientEmail}`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Correo</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="scrollbar-slim flex-1 space-y-6 overflow-y-auto overscroll-contain bg-white p-6 text-stone-800 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-1.5 text-orange-600 font-bold tracking-widest text-xs uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Yanbal Prestige</span>
              </div>
              <h2 className="font-editorial text-2xl font-bold text-stone-900">Factura de Venta</h2>
              <p className="text-xs text-stone-500">Red Independiente de Liderazgo y Belleza Yanbal</p>
            </div>
            <div className="text-left sm:text-right text-xs space-y-1">
              <p className="font-bold text-sm text-stone-900">{order.invoiceNumber}</p>
              <p className="text-stone-500">Fecha: {new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
              <div className="flex sm:justify-end gap-1.5 pt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${order.paymentStatus === 'pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.paymentStatus === 'anulada' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {order.paymentStatus === 'pagado' ? 'Pagado' : order.paymentStatus === 'anulada' ? 'Anulada' : order.paymentStatus === 'abono' ? 'Con Abono' : 'Pendiente Pago'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${order.deliveryStatus === 'entregado' ? 'bg-blue-50 text-blue-700 border-blue-200' : order.deliveryStatus === 'cancelado' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                  {order.deliveryStatus === 'entregado' ? 'Entregado' : order.deliveryStatus === 'cancelado' ? 'Cancelado' : order.deliveryStatus === 'camino' ? 'En Camino' : 'Preparación'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
            <div>
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block mb-1">Clienta</span>
              <p className="font-semibold text-stone-900">{order.clientName}</p>
              <p className="text-stone-600">Tel: {order.clientPhone}</p>
              {order.clientEmail && <p className="text-stone-600">Correo: {order.clientEmail}</p>}
              {order.clientDocumentId && <p className="text-stone-600">Documento: {order.clientDocumentId}</p>}
              <p className="text-stone-600">
                {order.clientCity}
                {order.clientNeighborhood ? ` • Barrio ${order.clientNeighborhood}` : ''}
                {order.clientAddress ? ` • ${order.clientAddress}` : ''}
                {order.clientPostalCode ? ` • CP ${order.clientPostalCode}` : ''}
              </p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block mb-1">Consultora</span>
              <p className="font-semibold text-stone-900">{order.consultantName}</p>
              <p className="text-stone-500 text-[11px]">Canal: {order.source === 'web_catalogo' ? 'Catálogo Web' : 'Venta Directa'}</p>
              {order.notes && <p className="text-stone-500 text-[11px] italic mt-1">Nota: {order.notes}</p>}
            </div>
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100/80 text-stone-600 uppercase font-semibold text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Unitario</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-stone-500 text-[11px]">{item.productCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800">{item.productName}</td>
                    <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">${item.unitPrice.toLocaleString('es-CO')}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-stone-900">${item.subtotal.toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-stretch justify-end gap-3 pt-1 sm:flex-row sm:items-start">
            {order.payments && order.payments.length > 0 && (
              <div className="flex-1 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5">
                <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <History className="h-3 w-3" /> Pagos registrados
                </span>
                <ul className="space-y-1">
                  {order.payments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-stone-600">
                        {new Date(payment.date).toLocaleDateString('es-CO')} ·{' '}
                        {PAYMENT_METHOD_LABELS[payment.method]}
                      </span>
                      <strong className="text-stone-900">{formatCop(payment.amount)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="w-full space-y-1 rounded-2xl border border-brand-apricot/25 bg-brand-apricot-soft/60 p-3.5 text-right sm:w-60">
              <span className="block text-[11px] font-semibold text-brand-espresso">Total liquidado</span>
              <p className="font-editorial text-xl font-bold text-brand-apricot-dark">
                {formatCop(order.totalAmount)} <span className="text-xs font-normal">COP</span>
              </p>
              <div className="flex items-center justify-between gap-2 border-t border-brand-apricot/20 pt-1 text-[11px]">
                <span className="text-stone-500">Abonado</span>
                <strong className="text-emerald-700">{formatCop(paid)}</strong>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-stone-500">Saldo</span>
                <strong className={balance > 0 ? 'text-brand-apricot-dark' : 'text-emerald-700'}>
                  {formatCop(balance)}
                </strong>
              </div>
              <span className="block text-[10px] text-stone-400">IVA incluido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
