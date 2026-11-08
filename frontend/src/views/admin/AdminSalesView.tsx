import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { InvoiceModal } from '../../components/sales/InvoiceModal';
import { RegisterPaymentModal } from '../../components/sales/RegisterPaymentModal';
import { AdminSalesRow } from '../../components/sales/AdminSalesRow';
import { PaginationControls } from '../../components/common/PaginationControls';
import { useConfig } from '../../context/ConfigContext';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import type { Order } from '../../types';

const PAGE_SIZE = 15;

export const AdminSalesView: React.FC = () => {
  const { orders, users, updateOrderStatus, assignOrder, saveOrder } = useConfig();
  const { logout } = useAuth();
  const { notify } = useToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('todos');
  const [deliveryFilter, setDeliveryFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  useIdleTimer({ timeoutMs: 15 * 60 * 1000, onIdle: () => logout() });

  const consultants = useMemo(
    () => users.filter((u) => u.active && ['CONSULTORA', 'LIDER_ZONA'].includes(u.role)),
    [users]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        !searchTerm ||
        ord.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.consultantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPayment = paymentFilter === 'todos' || ord.paymentStatus === paymentFilter;
      const matchDelivery = deliveryFilter === 'todos' || ord.deliveryStatus === deliveryFilter;
      return matchSearch && matchPayment && matchDelivery;
    });
  }, [orders, searchTerm, paymentFilter, deliveryFilter]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const handleCancelOrder = async (ord: Order) => {
    const accepted = await confirm({
      title: '¿Anular esta factura?',
      message: `La factura ${ord.invoiceNumber} de ${ord.clientName} quedará anulada para contabilidad.`,
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
      message: `La factura ${ord.invoiceNumber} volverá a preparación.`,
      confirmText: 'Sí, reactivar',
    });
    if (!accepted) return;
    updateOrderStatus(ord.id, undefined, 'preparacion');
    notify(`Factura ${ord.invoiceNumber} reactivada.`, 'info');
  };

  const handleAssign = async (ord: Order, consultantId: string) => {
    const consultant = consultants.find((c) => c.id === consultantId);
    if (!consultant) return;
    const accepted = await confirm({
      title: '¿Reasignar esta factura?',
      message: `La factura ${ord.invoiceNumber} pasará de ${ord.consultantName} a ${consultant.name}.`,
      confirmText: 'Sí, reasignar',
    });
    if (!accepted) return;
    assignOrder(ord.id, consultant.id, consultant.name);
    notify(`Factura ${ord.invoiceNumber} reasignada a ${consultant.name}.`, 'info');
  };

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todos los Pagos</option>
              <option value="pendiente">Pendiente Pago</option>
              <option value="abono">Con Abono</option>
              <option value="pagado">Pagado Completo</option>
              <option value="anulada">Anulada</option>
            </select>
            <select
              value={deliveryFilter}
              onChange={(e) => {
                setDeliveryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todas las Entregas</option>
              <option value="preparacion">En Preparación</option>
              <option value="camino">En Camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur text-stone-600 uppercase font-semibold text-[10px] border-b border-stone-200 shadow-2xs">
                <tr>
                  <th className="py-3 px-4">Factura</th>
                  <th className="py-3 px-4">Clienta</th>
                  <th className="py-3 px-4">Consultora Asignada</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Abonado / Saldo</th>
                  <th className="py-3 px-4">Estado Pago</th>
                  <th className="py-3 px-4">Estado Entrega</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      No se encontraron pedidos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((ord) => (
                    <AdminSalesRow
                      key={ord.id}
                      order={ord}
                      consultants={consultants}
                      onAssign={handleAssign}
                      onUpdateStatus={(id, status) => {
                        updateOrderStatus(id, undefined, status);
                        notify(`Entrega actualizada a ${status}.`, 'info');
                      }}
                      onCancel={handleCancelOrder}
                      onReactivate={handleReactivateOrder}
                      onSelectOrder={setSelectedOrder}
                      onPaymentOrder={setPaymentOrder}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemName="facturas"
        />
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
