import React, { useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { InvoiceModal } from '../../components/sales/InvoiceModal';
import { useConfig } from '../../context/ConfigContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import { useAuth } from '../../context/AuthContext';
import type { Order, PaymentStatus, DeliveryStatus } from '../../types';

export const AdminSalesView: React.FC = () => {
  const { orders, users, updateOrderStatus, assignOrder } = useConfig();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [deliveryFilter, setDeliveryFilter] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useIdleTimer({ timeoutMs: 15 * 60 * 1000, onIdle: () => logout() });

  const consultants = useMemo(() => users.filter((u) => u.active), [users]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        ord.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.consultantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPayment = paymentFilter === 'todos' || ord.paymentStatus === paymentFilter;
      const matchDelivery = deliveryFilter === 'todos' || ord.deliveryStatus === deliveryFilter;
      return matchSearch && matchPayment && matchDelivery;
    });
  }, [orders, searchTerm, paymentFilter, deliveryFilter]);

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Control de Facturación & Despachos
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Ventas y Órdenes de la Red
            </h2>
            <p className="text-xs text-stone-500">
              Supervisión de pedidos, reasignación a consultoras y liquidación de pagos.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200 self-start sm:self-auto">
            {filteredOrders.length} Órdenes
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por N° Factura, clienta o consultora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todos los Pagos</option>
              <option value="pendiente">Pendiente Pago</option>
              <option value="abono">Con Abono</option>
              <option value="pagado">Pagado Completo</option>
            </select>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todas las Entregas</option>
              <option value="preparacion">En Preparación</option>
              <option value="camino">En Camino</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Factura</th>
                  <th className="py-3 px-4">Clienta</th>
                  <th className="py-3 px-4">Consultora Asignada</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Estado Pago</th>
                  <th className="py-3 px-4">Estado Entrega</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No se encontraron pedidos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-800">{ord.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-stone-900">{ord.clientName}</p>
                        <p className="text-[11px] text-stone-400">{ord.clientPhone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.consultantId}
                          onChange={(e) => {
                            const u = consultants.find((c) => c.id === e.target.value);
                            if (u) assignOrder(ord.id, u.id, u.name);
                          }}
                          className="p-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 text-stone-800 font-medium"
                        >
                          {consultants.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.role === 'DIRECTORA' ? 'Directora' : 'Consultora'})
                            </option>
                          ))}
                        </select>
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
                          className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-orange-50 hover:text-orange-600 text-stone-600 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
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

      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
