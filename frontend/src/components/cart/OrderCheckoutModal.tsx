import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import type { CartItem, Order } from '../../types';
import { useConfig } from '../../context/ConfigContext';
import { PostalCodeField } from '../common/PostalCodeField';

interface OrderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalPrice: number;
  onOrderSuccess: (order: Order) => void;
}

export const OrderCheckoutModal: React.FC<OrderCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  onOrderSuccess,
}) => {
  const { saveOrder, users, orders } = useConfig();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [acceptedHabeasData, setAcceptedHabeasData] = useState(false);
  const [trapField, setTrapField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const defaultConsultant = users.find((u) => u.active && u.role === 'CONSULTORA') || users[0] || {
    id: 'usr-2',
    name: 'Carolina Mejía',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Detección Anti-Bots (Honeypot)
    if (trapField && trapField.trim() !== '') {
      alert('Validación de seguridad perimetral activada.');
      return;
    }

    // 2. Validación de Ley 1581 (Habeas Data)
    if (!acceptedHabeasData) {
      alert('Debe aceptar la política de tratamiento de datos personales según la Ley 1581 de 2012.');
      return;
    }

    // 3. Blindaje Anti-Doble Clic
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Correlativo real: toma el mayor consecutivo del año y suma 1.
      // Antes se usaba Math.random(), lo que podía repetir facturas.
      const year = new Date().getFullYear();
      const prefix = `FAC-${year}-`;
      const lastSeq = orders.reduce((max, order) => {
        if (!order.invoiceNumber?.startsWith(prefix)) return max;
        const seq = Number.parseInt(order.invoiceNumber.slice(prefix.length), 10);
        return Number.isFinite(seq) && seq > max ? seq : max;
      }, 0);
      const invoiceNumber = `${prefix}${String(lastSeq + 1).padStart(3, '0')}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        invoiceNumber,
        clientName: fullName.trim(),
        clientPhone: phone.trim(),
        clientCity: city.trim(),
        clientAddress: address.trim(),
        clientEmail: email.trim(),
        clientDocumentId: documentId.trim(),
        clientNeighborhood: neighborhood.trim(),
        clientPostalCode: postalCode.trim(),
        consultantId: defaultConsultant.id,
        consultantName: defaultConsultant.name,
        totalAmount: totalPrice,
        paymentStatus: 'pendiente',
        deliveryStatus: 'preparacion',
        source: 'web_catalogo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.product.id,
          productCode: item.product.code,
          productName: item.product.name,
          unitPrice: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
      };

      // El backend es la fuente de verdad: usa la factura y los totales que
      // devuelve la API, no los valores calculados por el navegador.
      const saved = await saveOrder(newOrder);
      if (!saved) {
        alert('No se pudo registrar el pedido en el servidor. Inténtalo de nuevo.');
        return;
      }
      setCompletedOrder(saved);
      onOrderSuccess(saved);

      // 4. Formateo y apertura de WhatsApp con el pedido oficial
      const cleanPhone = phone.replace(/\D/g, '');
      const itemsList = saved.items
        .map((it) => `• ${it.quantity}x ${it.productName} (${it.productCode}) - $${it.subtotal.toLocaleString('es-CO')}`)
        .join('\n');

      const msg = `👑 *YANBAL PRESTIGE - AUTOPEDIDO WEB*\n🧾 *N° Factura:* ${saved.invoiceNumber}\n👤 *Cliente:* ${fullName.trim()} (${phone.trim()})\n📧 *Correo:* ${email.trim() || 'No indicado'}\n📍 *Ciudad:* ${city.trim()}${neighborhood ? ' - Barrio ' + neighborhood.trim() : ''}${address ? ' - ' + address.trim() : ''}${postalCode ? ' - CP ' + postalCode.trim() : ''}\n\n📦 *Productos Solicitados:*\n${itemsList}\n\n💰 *TOTAL ESTIMADO: $${saved.totalAmount.toLocaleString('es-CO')} COP*\n\nHola ${defaultConsultant.name}, he completado mi autopedido en el catálogo oficial. ¿Me ayudas a coordinar el pago y despacho? ✨`;

      const targetWp = cleanPhone.length >= 10 ? cleanPhone : '573000000000';
      const wpUrl = `https://wa.me/${targetWp}?text=${encodeURIComponent(msg)}`;
      window.open(wpUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Confirmación de Pedido Seguro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-editorial text-2xl font-bold text-stone-900">
              ¡Pedido Registrado con Éxito!
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Tu orden ha sido registrada bajo la factura oficial{' '}
              <strong className="text-orange-600 font-mono font-bold">{completedOrder.invoiceNumber}</strong> y
              asignada a tu Consultora Yanbal Prestige.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
            >
              Finalizar y Continuar Navegando
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Honeypot perimetral */}
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              className="hp-field"
              value={trapField}
              onChange={(e) => setTrapField(e.target.value)}
            />

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Camila Restrepo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">WhatsApp / Teléfono *</label>
                <input
                  type="tel"
                  required
                  placeholder="+57 312 456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Correo para la factura</label>
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Cédula / NIT (opcional)</label>
                <input
                  type="text"
                  placeholder="Para la factura"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Ciudad / Municipio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bogotá D.C."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Barrio / Localidad</label>
                <input
                  type="text"
                  placeholder="Ej. Chapinero"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Código postal</label>
                <PostalCodeField
                  value={postalCode}
                  onChange={setPostalCode}
                  className="px-3.5 py-2"
                  placeholder="Ej. 110221"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Dirección de Despacho</label>
              <input
                type="text"
                placeholder="Calle 127 # 15-42 Apto 402"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-orange-500 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-stone-400">
                Usaremos el correo para enviarte la factura y el WhatsApp para coordinar la entrega.
              </p>
            </div>

            {/* Resumen Total */}
            <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200/80 flex items-center justify-between">
              <span className="text-stone-700 font-medium">Total de tu Pedido:</span>
              <span className="font-editorial text-lg font-bold text-stone-900">
                ${totalPrice.toLocaleString('es-CO')} COP
              </span>
            </div>

            {/* Checkbox Obligatorio Ley 1581 (Habeas Data) */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptedHabeasData}
                  onChange={(e) => setAcceptedHabeasData(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-[11px] text-stone-500 leading-tight">
                  Autorizo el tratamiento de mis datos personales según la{' '}
                  <strong>Ley 1581 de 2012 (Habeas Data Colombia)</strong> para la gestión de este pedido y
                  contacto por WhatsApp con mi Consultora Yanbal.
                </span>
              </label>
            </div>

            {/* Botón de Confirmación con Protección Anti-Doble Clic */}
            <button
              type="submit"
              disabled={isSubmitting || !acceptedHabeasData}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando Pedido...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Pedido y Abrir WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
