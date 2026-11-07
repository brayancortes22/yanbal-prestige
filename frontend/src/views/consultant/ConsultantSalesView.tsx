import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Search, Wallet, Ban, RotateCcw } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { InvoiceModal } from '../../components/sales/InvoiceModal';
import { RegisterPaymentModal } from '../../components/sales/RegisterPaymentModal';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import type { Order, DeliveryStatus } from '../../types';
import {
  PAYMENT_STATUS_LABELS,
  formatCop,
  getBalance,
  getPaidAmount,
} from '../../utils/payments';

export const ConsultantSalesView: React.FC = () => {
  const { orders, saveOrder, updateOrderStatus, users } = useConfig();
  const { username, logout } = useAuth();
  const { notify } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  useIdleTimer({ timeoutMs: 15 * 60 * 1000, onIdle: () => logout() });

  const activeConsultantName = username || 'Carolina Mejía';
  const consultantUser = users.find((u) => u.name.toLowerCase() === activeConsultantName.toLowerCase());
  const activeConsultantId = consultantUser ? consultantUser.id : 'usr-2';



  const myOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchConsultant =
        o.consultantId === activeConsultantId ||
        o.consultantName.toLowerCase() === activeConsultantName.toLowerCase();
      const matchSearch =
        o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchConsultant && matchSearch;
    });
  }, [orders, activeConsultantId, activeConsultantName, searchTerm]);

  const handleCancelOrder = async (ord: Order) => {
    const accepted = await confirm({
      title: '¿Anular esta factura?',
      message: `La factura ${ord.invoiceNumber} de ${ord.clientName} quedará anulada. Si ya recibiste dinero, registra la devolución desde "Registrar devolución".`,
      confirmText: 'Sí, anular factura',
      tone: 'danger',
    });
    if (!accepted) return;
    updateOrderStatus(ord.id, undefined, 'cancelado');
    notify(`Factura ${ord.invoiceNumber} anulada.`, 'info');
  };

  const handleReactivateOrder = async (ord: Order) => {
    const accepted = await confirm({
      title: '¿Reactivar esta factura?',
      message: `La factura ${ord.invoiceNumber} volverá a preparación y el estado de pago se recalculará.`,
      confirmText: 'Sí, reactivar',
    });
    if (!accepted) return;
    updateOrderStatus(ord.id, undefined, 'preparacion');
    notify(`Factura ${ord.invoiceNumber} reactivada.`, 'info');
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-brand-apricot block">
              Mis Pedidos & Despachos
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Ventas Personales de Campaña
            </h2>
            <p className="text-xs text-stone-500">
              Gestiona el despacho a tus clientas y comparte la factura oficial por WhatsApp.
            </p>
          </div>
          <button
            onClick={() => navigate('/consultora/ventas/nueva')}
            className="px-4 py-2.5 rounded-xl bg-brand-apricot hover:bg-brand-apricot-dark text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Venta Directa</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por N° Factura o clienta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {myOrders.length} {myOrders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Factura</th>
                  <th className="py-3 px-4">Clienta</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Abonado / Saldo</th>
                  <th className="py-3 px-4">Estado Pago</th>
                  <th className="py-3 px-4">Estado Entrega</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No tienes pedidos registrados todavía. ¡Comienza haciendo clic en Registrar Venta Directa!
                    </td>
                  </tr>
                ) : (
                  myOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-800">{ord.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900">{ord.clientName}</p>
                        <p className="text-[11px] text-stone-400">{ord.clientPhone}</p>
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
                            onClick={() => setPaymentOrder(ord)}
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
                            onChange={(e) => {
                              const status = e.target.value as DeliveryStatus;
                              updateOrderStatus(ord.id, undefined, status);
                              notify(
                                `Entrega de ${ord.invoiceNumber} actualizada a ${
                                  status === 'entregado'
                                    ? 'entregado'
                                    : status === 'camino'
                                      ? 'en camino'
                                      : 'en preparación'
                                }.`,
                                'info'
                              );
                            }}
                            className={`p-1.5 text-[11px] rounded-lg font-semibold border ${
                              ord.deliveryStatus === 'entregado' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-stone-50 text-stone-700 border-stone-200'
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
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-amber-50 hover:text-amber-700 text-stone-600 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Factura</span>
                          </button>
                          {ord.deliveryStatus === 'cancelado' ? (
                            <button
                              onClick={() => void handleReactivateOrder(ord)}
                              className="px-2 py-1.5 rounded-xl border border-stone-200 text-stone-600 text-[11px] font-medium inline-flex items-center gap-1 hover:bg-stone-50 cursor-pointer"
                              title="Reactivar factura"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reactivar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => void handleCancelOrder(ord)}
                              className="px-2 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-[11px] font-medium inline-flex items-center gap-1 hover:bg-rose-50 cursor-pointer"
                              title="Anular por cancelación o devolución"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Anular</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RegisterPaymentModal
        order={paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onSave={saveOrder}
      />

      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
