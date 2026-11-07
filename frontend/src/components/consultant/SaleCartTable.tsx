import React from 'react';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import type { OrderItem } from '../../types';
import { formatCop } from '../../utils/payments';

interface SaleCartTableProps {
  items: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

/** Carrito en formato tabla, con la foto del producto en cada línea. */
export const SaleCartTable: React.FC<SaleCartTableProps> = ({
  items,
  onUpdateQuantity,
  onRemove,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-8 text-center">
        <ShoppingCart className="h-7 w-7 text-stone-300" />
        <p className="text-[11px] font-medium text-stone-500">Aún no has agregado productos.</p>
        <p className="text-[10px] text-stone-400">Usa la tabla de productos para armar el pedido.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-stone-200 bg-stone-50 text-[10px] font-semibold uppercase text-stone-500">
          <tr>
            <th className="px-3 py-2">Producto</th>
            <th className="px-2 py-2 text-center">Cant.</th>
            <th className="px-2 py-2 text-right">Subtotal</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {items.map((item) => (
            <tr key={item.productId}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-9 w-9 rounded-lg border border-stone-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                      <ShoppingCart className="h-4 w-4 text-stone-400" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-stone-900">
                      {item.productName}
                    </span>
                    <span className="block font-mono text-[10px] text-stone-400">
                      {item.productCode} · {formatCop(item.unitPrice)}
                    </span>
                  </span>
                </div>
              </td>
              <td className="px-2 py-2">
                <div className="mx-auto flex w-fit items-center rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    className="cursor-pointer px-1.5 py-0.5 text-stone-500 hover:text-brand-apricot"
                    aria-label="Quitar una unidad"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center font-mono text-[10px] font-bold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="cursor-pointer px-1.5 py-0.5 text-stone-500 hover:text-brand-apricot"
                    aria-label="Agregar una unidad"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </td>
              <td className="px-2 py-2 text-right font-semibold text-stone-900">
                {formatCop(item.subtotal)}
              </td>
              <td className="px-2 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="cursor-pointer rounded-lg p-1 text-stone-300 hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Quitar ${item.productName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
