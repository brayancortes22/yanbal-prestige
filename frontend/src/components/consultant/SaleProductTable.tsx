import React, { useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { formatCop } from '../../utils/payments';

interface SaleProductTableProps {
  products: Product[];
  onAdd: (product: Product, quantity: number) => void;
}

const categories = [
  { value: 'todas', label: 'Todas' },
  { value: 'rostro', label: 'Rostro' },
  { value: 'solar', label: 'Solar' },
  { value: 'perfumes', label: 'Perfumes' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'joyeria', label: 'Joyería' },
];

/**
 * Tabla de referencias con foto, pensada para una página completa de venta.
 * Cada fila tiene su propia cantidad y botón de agregar.
 */
export const SaleProductTable: React.FC<SaleProductTableProps> = ({ products, onAdd }) => {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('todas');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filtered = useMemo(() => {
    const clean = term.trim().toLowerCase();
    return products.filter((product) => {
      const matchCategory = category === 'todas' || product.category === category;
      const matchSearch =
        !clean ||
        product.name.toLowerCase().includes(clean) ||
        product.code.toLowerCase().includes(clean) ||
        product.categoryLabel.toLowerCase().includes(clean);
      return product.active && matchCategory && matchSearch;
    });
  }, [products, term, category]);

  const quantityOf = (id: string) => quantities[id] ?? 1;
  const setQuantity = (id: string, value: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, value)) }));

  return (
    <section className="space-y-3 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-xs">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-apricot">
            Paso 2
          </span>
          <h3 className="font-editorial text-lg font-bold text-stone-900">Productos del catálogo</h3>
          <p className="text-[11px] text-stone-500">
            Busca la referencia, ajusta la cantidad y agrégala al pedido.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar por nombre, SKU o categoría..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2 pl-9 pr-3 text-xs"
          />
        </div>
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
              category === item.value
                ? 'border-brand-apricot bg-brand-apricot text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50 text-[10px] font-semibold uppercase text-stone-500">
              <tr>
                <th className="px-3 py-2.5">Foto</th>
                <th className="px-3 py-2.5">Referencia</th>
                <th className="px-3 py-2.5 text-right">Precio</th>
                <th className="px-3 py-2.5 text-center">Cantidad</th>
                <th className="px-3 py-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-stone-400">
                    No hay referencias que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/60">
                    <td className="px-3 py-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-11 w-11 rounded-xl border border-stone-200 object-cover"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="block font-mono text-[10px] font-bold text-brand-apricot-dark">
                        {product.code}
                      </span>
                      <span className="block font-semibold text-stone-900">{product.name}</span>
                      <span className="block text-[10px] text-stone-400">{product.categoryLabel}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <strong className="block text-stone-900">{formatCop(product.price)}</strong>
                      {product.originalPrice && (
                        <span className="text-[10px] text-stone-400 line-through">
                          {formatCop(product.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="mx-auto flex w-fit items-center rounded-xl border border-stone-200 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantityOf(product.id) - 1)}
                          className="cursor-pointer px-2 py-1 text-stone-500 hover:text-brand-apricot"
                          aria-label="Quitar una unidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-[11px] font-bold">
                          {quantityOf(product.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, quantityOf(product.id) + 1)}
                          className="cursor-pointer px-2 py-1 text-stone-500 hover:text-brand-apricot"
                          aria-label="Agregar una unidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onAdd(product, quantityOf(product.id))}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-brand-espresso px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-stone-800"
                      >
                        <ShoppingBag className="h-3 w-3" /> Agregar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
