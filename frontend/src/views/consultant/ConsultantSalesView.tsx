import React, { useState, useMemo } from 'react';
import { Plus, Eye, Search } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { InvoiceModal } from '../../components/sales/InvoiceModal';
import { DirectSaleModal } from '../../components/consultant/DirectSaleModal';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import type { Order, PaymentStatus, DeliveryStatus } from '../../types';

export const ConsultantSalesView: React.FC = () => {
  const { orders, clients, products, saveOrder, updateOrderStatus, users } = useConfig();
  const { username, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <ConsultantNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block">
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
            onClick={() => setIsSaleModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
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
                  <th className="py-3 px-4">Estado Pago</th>
                  <th className="py-3 px-4">Estado Entrega</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
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
                      <td className="py-3 px-4 font-bold text-stone-900">${ord.totalAmount.toLocaleString('es-CO')}</td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as PaymentStatus, undefined)}
                          className={`p-1.5 text-[11px] rounded-lg font-semibold border ${
                            ord.paymentStatus === 'pagado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="abono">Abono</option>
                          <option value="pagado">Pagado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.deliveryStatus}
                          onChange={(e) => updateOrderStatus(ord.id, undefined, e.target.value as DeliveryStatus)}
                          className={`p-1.5 text-[11px] rounded-lg font-semibold border ${
                            ord.deliveryStatus === 'entregado' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          <option value="preparacion">Preparación</option>
                          <option value="camino">En Camino</option>
                          <option value="entregado">Entregado</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-amber-50 hover:text-amber-700 text-stone-600 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Factura</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DirectSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        clients={clients}
        products={products}
        consultantId={activeConsultantId}
        consultantName={activeConsultantName}
        onSaveOrder={saveOrder}
      />

      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
