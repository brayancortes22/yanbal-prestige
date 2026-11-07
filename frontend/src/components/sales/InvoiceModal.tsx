import React from 'react';
import { X, Printer, Share2, Sparkles } from 'lucide-react';
import type { Order } from '../../types';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handleShareWhatsApp = () => {
    const itemsList = order.items
      .map((it) => `• ${it.quantity}x ${it.productName} (${it.productCode}) - $${it.subtotal.toLocaleString('es-CO')}`)
      .join('\n');
    const msg = `👑 *YANBAL PRESTIGE - FACTURA OFICIAL*\n🧾 *N° Factura:* ${order.invoiceNumber}\n🗓️ *Fecha:* ${new Date(order.createdAt).toLocaleDateString('es-CO')}\n👩‍💼 *Consultora:* ${order.consultantName}\n👤 *Clienta:* ${order.clientName} (${order.clientPhone})\n📍 *Ciudad:* ${order.clientCity}${order.clientAddress ? ' - ' + order.clientAddress : ''}\n\n📦 *Detalle del Pedido:*\n${itemsList}\n\n💰 *TOTAL A PAGAR: $${order.totalAmount.toLocaleString('es-CO')} COP*\n✨ *Estado Pago:* ${order.paymentStatus.toUpperCase()}\n🚚 *Estado Entrega:* ${order.deliveryStatus.toUpperCase()}\n\n¡Gracias por tu confianza en Yanbal Prestige! ✨`;
    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Comprobante de Venta</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
              {order.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-800">
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
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${order.paymentStatus === 'pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {order.paymentStatus === 'pagado' ? 'Pagado' : order.paymentStatus === 'abono' ? 'Con Abono' : 'Pendiente Pago'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${order.deliveryStatus === 'entregado' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                  {order.deliveryStatus === 'entregado' ? 'Entregado' : order.deliveryStatus === 'camino' ? 'En Camino' : 'Preparación'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
            <div>
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px] block mb-1">Clienta</span>
              <p className="font-semibold text-stone-900">{order.clientName}</p>
              <p className="text-stone-600">Tel: {order.clientPhone}</p>
              <p className="text-stone-600">{order.clientCity}{order.clientAddress ? ` • ${order.clientAddress}` : ''}</p>
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

          <div className="flex justify-end pt-1">
            <div className="w-60 bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200/80 space-y-0.5 text-right">
              <span className="text-[11px] font-semibold text-orange-900 block">Total Liquidado</span>
              <p className="text-xl font-bold font-editorial text-orange-700">${order.totalAmount.toLocaleString('es-CO')} <span className="text-xs font-normal">COP</span></p>
              <span className="text-[10px] text-stone-400 block">IVA incluido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
