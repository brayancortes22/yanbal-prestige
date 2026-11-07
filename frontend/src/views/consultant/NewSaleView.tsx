import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react';
import { ConsultantNav } from '../../components/consultant/ConsultantNav';
import { DirectSaleClientFields } from '../../components/consultant/DirectSaleClientFields';
import { DirectSalePaymentFields } from '../../components/consultant/DirectSalePaymentFields';
import { SaleProductTable } from '../../components/consultant/SaleProductTable';
import { SaleCartTable } from '../../components/consultant/SaleCartTable';
import { PrivacyModal } from '../../components/common/PrivacyModal';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import type { Order, OrderItem, PaymentMethod, PaymentRecord, PaymentStatus, Product } from '../../types';
import { derivePaymentStatus, formatCop } from '../../utils/payments';

const nextInvoiceNumber = (orders: Order[]): string => {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const last = orders.reduce((max, order) => {
    if (!order.invoiceNumber?.startsWith(prefix)) return max;
    const seq = Number.parseInt(order.invoiceNumber.slice(prefix.length), 10);
    return Number.isFinite(seq) && seq > max ? seq : max;
  }, 0);
  return `${prefix}${String(last + 1).padStart(3, '0')}`;
};

/**
 * Página completa para registrar una venta. Reemplaza el modal estrecho:
 * el catálogo se ve como tabla con foto, el carrito también, y el resumen
 * queda fijo al costado en escritorio.
 */
export const NewSaleView: React.FC = () => {
  const { products, clients, orders, users, saveOrder } = useConfig();
  const { email, username, role } = useAuth();
  const { notify } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const currentUser =
    users.find((user) => user.email.toLowerCase() === (email || '').toLowerCase()) ||
    users.find((user) => user.name.toLowerCase() === (username || '').toLowerCase());
  const consultantId = currentUser?.id || 'usr-2';
  const consultantName = currentUser?.name || username || 'Carolina Mejía';
  const myClients = useMemo(() => {
    if (role === 'DIRECTORA' || role === 'SUPER_ADMIN' || role === 'ASISTENTE') {
      return clients;
    }
    if (role === 'LIDER_ZONA' && currentUser) {
      const teamIds = new Set(
        users.filter((user) => user.leaderId === currentUser.id).map((user) => user.id)
      );
      teamIds.add(currentUser.id);
      return clients.filter(
        (client) => client.consultantId && teamIds.has(client.consultantId)
      );
    }
    return clients.filter((client) => client.consultantId === consultantId);
  }, [clients, users, role, currentUser, consultantId]);

  const [clientMode, setClientMode] = useState<'crm' | 'nuevo'>(
    myClients.length > 0 ? 'crm' : 'nuevo'
  );
  const [selectedClientId, setSelectedClientId] = useState(myClients[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientDocumentId, setClientDocumentId] = useState('');
  const [clientCity, setClientCity] = useState('Bogotá D.C.');
  const [clientNeighborhood, setClientNeighborhood] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPostalCode, setClientPostalCode] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendiente');
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nequi');
  const [paymentNote, setPaymentNote] = useState('');
  const [habeasConsent, setHabeasConsent] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [error, setError] = useState('');
  const autoModeApplied = useRef(false);

  // La caché pinta primero y los clientes llegan después; cuando eso pasa,
  // abre directamente el modo CRM con la primera clienta para no obligar a
  // escribir datos que ya existen.
  useEffect(() => {
    if (autoModeApplied.current || myClients.length === 0) return;
    autoModeApplied.current = true;
    setSelectedClientId((prev) => prev || myClients[0].id);
    setClientMode('crm');
  }, [myClients]);

  // Al elegir una clienta del CRM se completan sus datos de contacto y
  // despacho para no volver a escribirlos y para poder enviarle la factura.
  useEffect(() => {
    if (clientMode !== 'crm') return;
    const client = myClients.find((item) => item.id === selectedClientId);
    if (!client) return;
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientEmail(client.email || '');
    setClientDocumentId(client.documentId || '');
    setClientCity(client.city || 'Bogotá D.C.');
    setClientNeighborhood(client.neighborhood || '');
    setClientAddress(client.address || '');
    setClientPostalCode(client.postalCode || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, clientMode]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const addProduct = (product: Product, quantity: number) => {
    setError('');
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const nextQuantity = Math.min(99, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: nextQuantity,
                subtotal: nextQuantity * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          productImage: product.image,
          unitPrice: product.price,
          quantity,
          subtotal: product.price * quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safe = Math.max(1, Math.min(99, quantity));
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: safe, subtotal: safe * item.unitPrice }
          : item
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    let finalName = clientName.trim();
    let finalPhone = clientPhone.trim();
    if (clientMode === 'crm') {
      const client = myClients.find((item) => item.id === selectedClientId);
      if (!client) {
        setError('Selecciona una clienta del CRM o regístrala como nueva.');
        return;
      }
      finalName = client.name;
      finalPhone = client.phone;
    }

    if (!finalName || finalPhone.replace(/\D/g, '').length < 7) {
      setError('El nombre y un WhatsApp válido son obligatorios.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Agrega al menos un producto al pedido.');
      return;
    }
    if (!habeasConsent) {
      setError('Debes autorizar el tratamiento de datos (Ley 1581) para registrar la venta.');
      return;
    }

    const received = paymentStatus === 'pagado' ? totalAmount : Number(depositAmount) || 0;
    if (paymentStatus === 'abono' && (received <= 0 || received >= totalAmount)) {
      setError('El abono debe ser mayor a cero y menor al total. Si pagó todo, elige "Pagado".');
      return;
    }

    const accepted = await confirm({
      title: '¿Registrar esta venta?',
      message: `Se creará la factura por ${formatCop(totalAmount)} para ${finalName}${
        received > 0 ? ` con un pago inicial de ${formatCop(received)}` : ' como pendiente'
      }.`,
      confirmText: 'Sí, registrar venta',
    });
    if (!accepted) return;

    const payments: PaymentRecord[] =
      paymentStatus === 'pendiente'
        ? []
        : [
            {
              id: `pay-${Date.now()}`,
              amount: Math.round(received),
              method: paymentMethod,
              note: paymentNote.trim() || undefined,
              date: new Date().toISOString(),
            },
          ];

    const order: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber(orders),
      clientId: clientMode === 'crm' ? selectedClientId : undefined,
      clientName: finalName,
      clientPhone: finalPhone,
      clientCity: clientCity.trim() || 'Bogotá D.C.',
      clientAddress: clientAddress.trim(),
      clientEmail: clientEmail.trim(),
      clientDocumentId: clientDocumentId.trim(),
      clientNeighborhood: clientNeighborhood.trim(),
      clientPostalCode: clientPostalCode.trim(),
      consultantId,
      consultantName,
      items: cartItems,
      totalAmount,
      paymentStatus: derivePaymentStatus(totalAmount, received),
      deliveryStatus: 'preparacion',
      source: 'venta_directa',
      payments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveOrder(order);
    if (!saved) return;

    notify(
      `Venta ${saved.invoiceNumber} registrada por ${formatCop(totalAmount)}${
        received > 0 ? ` · pago inicial ${formatCop(received)}` : ''
      }.`
    );
    navigate('/consultora/ventas');
  };

  return (
    <div className="min-h-[85vh] animate-fadeIn bg-brand-cream">
      <ConsultantNav />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <div>
            <Link
              to="/consultora/ventas"
              className="mb-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400 hover:text-brand-apricot"
            >
              <ArrowLeft className="h-3 w-3" /> Volver a mis ventas
            </Link>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Registrar venta directa
            </h2>
            <p className="text-xs text-stone-500">
              Arma el pedido con fotos del catálogo, define el pago y confirma la factura.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-xl border border-brand-apricot/25 bg-brand-apricot-soft/60 px-3 py-2 text-[11px] font-semibold text-brand-apricot-dark sm:self-auto">
            <ClipboardList className="h-4 w-4" />
            {cartItems.length} {cartItems.length === 1 ? 'línea' : 'líneas'} · {formatCop(totalAmount)}
          </span>
        </div>

        {error && (
          <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="order-1 space-y-3 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs lg:col-span-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-apricot">
                Paso 1
              </span>
              <h3 className="font-editorial text-lg font-bold text-stone-900">Clienta</h3>
              <p className="text-[11px] text-stone-500">
                Búscala en tu CRM o registra sus datos para esta venta.
              </p>
            </div>
            <DirectSaleClientFields
              clientMode={clientMode}
              setClientMode={setClientMode}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              clients={myClients}
              clientName={clientName}
              setClientName={setClientName}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              clientDocumentId={clientDocumentId}
              setClientDocumentId={setClientDocumentId}
              clientCity={clientCity}
              setClientCity={setClientCity}
              clientNeighborhood={clientNeighborhood}
              setClientNeighborhood={setClientNeighborhood}
              clientAddress={clientAddress}
              setClientAddress={setClientAddress}
              clientPostalCode={clientPostalCode}
              setClientPostalCode={setClientPostalCode}
            />
          </section>

          <aside className="order-2 space-y-4 lg:col-span-1 lg:row-span-2 lg:sticky lg:top-36 lg:self-start">
            <section className="space-y-3 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-apricot">
                  Paso 3
                </span>
                <h3 className="font-editorial text-lg font-bold text-stone-900">Pedido</h3>
              </div>

              <SaleCartTable
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemove={(productId) =>
                  setCartItems((prev) => prev.filter((item) => item.productId !== productId))
                }
              />

              <DirectSalePaymentFields
                total={totalAmount}
                status={paymentStatus}
                setStatus={setPaymentStatus}
                amount={depositAmount}
                setAmount={setDepositAmount}
                method={paymentMethod}
                setMethod={setPaymentMethod}
                note={paymentNote}
                setNote={setPaymentNote}
              />

              <label className="flex items-start gap-2 rounded-xl bg-stone-50 p-2.5 text-[10px] leading-tight text-stone-500">
                <input
                  type="checkbox"
                  checked={habeasConsent}
                  onChange={(event) => setHabeasConsent(event.target.checked)}
                  className="mt-0.5 rounded text-brand-apricot focus:ring-brand-apricot"
                />
                <span>
                  Autorizo el tratamiento de datos personales conforme a la{' '}
                  <button
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="cursor-pointer font-semibold text-brand-apricot underline"
                  >
                    Ley 1581 de 2012
                  </button>
                  .
                </span>
              </label>

              <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                <span>
                  <span className="block text-[10px] font-semibold uppercase text-stone-400">
                    Total
                  </span>
                  <strong className="font-editorial text-xl text-brand-apricot-dark">
                    {formatCop(totalAmount)}
                  </strong>
                </span>
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-apricot px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-apricot-dark disabled:opacity-50"
                  disabled={cartItems.length === 0}
                >
                  <CheckCircle2 className="h-4 w-4" /> Registrar venta
                </button>
              </div>
            </section>

            <div className="flex items-start gap-2 rounded-2xl border border-stone-200 bg-white/70 p-3 text-[10px] text-stone-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                El pedido queda en estado <strong>preparación</strong>. Podrás registrar abonos o
                corregir el pago desde <strong>Mis ventas</strong>.
              </span>
            </div>
          </aside>

          <div className="order-3 lg:col-span-2">
            <SaleProductTable products={products} onAdd={addProduct} />
          </div>
        </form>
      </div>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
};
