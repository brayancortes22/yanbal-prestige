import React, { useState } from 'react';
import { X, Plus, ShoppingBag } from 'lucide-react';
import type { Order, OrderItem, Product, ConsultantClient } from '../../types';
import { DirectSaleClientFields } from './DirectSaleClientFields';
import { DirectSaleItemsList } from './DirectSaleItemsList';
import { PrivacyModal } from '../common/PrivacyModal';

interface DirectSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ConsultantClient[];
  products: Product[];
  consultantId: string;
  consultantName: string;
  onSaveOrder: (order: Order) => void;
}

export const DirectSaleModal: React.FC<DirectSaleModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  consultantId,
  consultantName,
  onSaveOrder,
}) => {
  if (!isOpen) return null;

  const [clientMode, setClientMode] = useState<'crm' | 'nuevo'>('crm');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('Bogotá D.C.');
  const [clientAddress, setClientAddress] = useState('');
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [habeasConsent, setHabeasConsent] = useState(true);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === prod.id
            ? { ...i, quantity: i.quantity + quantity, subtotal: (i.quantity + quantity) * i.unitPrice }
            : i
        );
      }
      return [...prev, {
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        unitPrice: prod.price,
        quantity,
        subtotal: prod.price * quantity,
      }];
    });
  };

  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !habeasConsent || cartItems.length === 0) return;

    let finalName = clientName;
    let finalPhone = clientPhone;
    if (clientMode === 'crm') {
      const c = clients.find((cli) => cli.id === selectedClientId);
      if (c) {
        finalName = c.name;
        finalPhone = c.phone;
      }
    }
    if (!finalName) return;

    setIsSubmitting(true);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: `FAC-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: clientMode === 'crm' ? selectedClientId : undefined,
      clientName: finalName,
      clientPhone: finalPhone || '+57 300 000 0000',
      clientCity,
      clientAddress,
      consultantId,
      consultantName,
      items: cartItems,
      totalAmount,
      paymentStatus: 'pendiente',
      deliveryStatus: 'preparacion',
      source: 'venta_directa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveOrder(newOrder);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <h3 className="font-editorial text-lg font-bold text-stone-900">Registrar Venta Directa</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
            <DirectSaleClientFields
              clientMode={clientMode}
              setClientMode={setClientMode}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              clients={clients}
              clientName={clientName}
              setClientName={setClientName}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
              clientCity={clientCity}
              setClientCity={setClientCity}
              clientAddress={clientAddress}
              setClientAddress={setClientAddress}
            />

            <div className="pt-2 border-t border-stone-200">
              <label className="font-semibold text-stone-700 block mb-1">Agregar Productos al Pedido</label>
              <div className="flex gap-2">
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  {products.filter((p) => p.active).map((p) => (
                    <option key={p.id} value={p.id}>[{p.code}] {p.name} - ${p.price.toLocaleString('es-CO')}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 p-2 rounded-xl border border-stone-200 bg-stone-50/50 text-center"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <DirectSaleItemsList items={cartItems} onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.productId !== id))} />

            <div className="flex items-start gap-2 pt-2 border-t border-stone-100">
              <input
                type="checkbox"
                id="habeasDirect"
                checked={habeasConsent}
                onChange={(e) => setHabeasConsent(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="habeasDirect" className="text-[10px] text-stone-500 leading-tight">
                Consentimiento de datos conforme a la{' '}
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-amber-700 underline font-semibold cursor-pointer"
                >
                  Ley 1581 Habeas Data
                </button>.
              </label>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-200">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Venta</span>
                <span className="text-base font-bold text-amber-700">${totalAmount.toLocaleString('es-CO')} COP</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !habeasConsent || cartItems.length === 0}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold cursor-pointer shadow-sm transition-all"
              >
                {isSubmitting ? 'Registrando Pedido...' : 'Registrar Venta Directa'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
};
