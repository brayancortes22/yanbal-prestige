import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { OrderItem, Product } from '../../types';

interface DirectSaleProductPickerProps {
  products: Product[];
  selectedProdId: string;
  setSelectedProdId: (id: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  cartItems: OrderItem[];
  onAddItem: () => void;
  onRemoveItem: (productId: string) => void;
}

export const DirectSaleProductPicker: React.FC<DirectSaleProductPickerProps> = ({
  products,
  selectedProdId,
  setSelectedProdId,
  quantity,
  setQuantity,
  cartItems,
  onAddItem,
  onRemoveItem,
}) => {
  return (
    <div className="space-y-3">
      <div className="pt-2 border-t border-stone-200">
        <label className="font-semibold text-stone-700 block mb-1">Agregar Productos al Pedido</label>
        <div className="flex gap-2">
          <select
            value={selectedProdId}
            onChange={(e) => setSelectedProdId(e.target.value)}
            className="flex-1 p-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:border-amber-400 focus:outline-none"
          >
            {products
              .filter((p) => p.active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name} - ${p.price.toLocaleString('es-CO')}
                </option>
              ))}
          </select>
          <input
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 p-2 rounded-xl border border-stone-200 bg-stone-50/50 text-center focus:border-amber-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onAddItem}
            className="px-3 py-2 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 max-h-36 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.productId} className="p-2 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-semibold text-stone-800">{item.productName}</span>
                <span className="text-stone-400 block">
                  {item.quantity} x ${item.unitPrice.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">${item.subtotal.toLocaleString('es-CO')}</span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.productId)}
                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
