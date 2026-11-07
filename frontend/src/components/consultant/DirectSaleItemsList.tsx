import React from 'react';
import { Trash2 } from 'lucide-react';
import type { OrderItem } from '../../types';

interface DirectSaleItemsListProps {
  items: OrderItem[];
  onRemoveItem: (productId: string) => void;
}

export const DirectSaleItemsList: React.FC<DirectSaleItemsListProps> = ({ items, onRemoveItem }) => {
  if (items.length === 0) return null;

  return (
    <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 max-h-32 overflow-y-auto">
      {items.map((item) => (
        <div key={item.productId} className="p-2 flex items-center justify-between text-[11px]">
          <div>
            <span className="font-semibold text-stone-800">{item.productName}</span>
            <span className="text-stone-400 block">{item.quantity} x ${item.unitPrice.toLocaleString('es-CO')}</span>
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
  );
};
