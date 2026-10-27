import React, { useState } from 'react';
import { Tag, Power, Edit3, Trash2, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import type { Product } from '../../../types';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onToggle: (id: string) => void;
}

const ITEMS_PER_PAGE = 6;

export const ProductTable: React.FC<Props> = ({ products, onEdit, onDelete, onToggle }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
            <tr>
              <th className="p-4">Código / SKU</th>
              <th className="p-4">Producto</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Precio COP</th>
              <th className="p-4">Estado Stock</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.map((product) => (
              <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                <td className="p-4 font-mono font-bold text-amber-700 bg-amber-50/30 whitespace-nowrap">
                  <Tag className="w-3 h-3 inline mr-1 text-amber-600" />
                  {product.code}
                </td>
                <td className="p-4 font-semibold text-stone-900">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-100 shrink-0"
                    />
                    <span className={!product.active ? 'line-through text-stone-400' : ''}>
                      {product.name}
                    </span>
                    {product.media && product.media.length > 1 && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 text-[10px] font-bold text-stone-500 shrink-0"
                        title={`${product.media.length} archivos en la galería`}
                      >
                        <Images className="w-3 h-3" />
                        {product.media.length}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-stone-600">{product.categoryLabel}</td>
                <td className="p-4 font-bold text-stone-900">
                  ${product.price.toLocaleString('es-CO')}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => onToggle(product.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                      product.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="Clic para pausar o activar en catálogo"
                  >
                    <Power className="w-3 h-3" />
                    <span>{product.active ? 'En Catálogo' : 'Pausado / Agotado'}</span>
                  </button>
                </td>
                <td className="p-4 text-right space-x-1">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 text-stone-600 hover:text-orange-700 font-semibold text-[11px] transition-colors cursor-pointer"
                    title="Editar referencia"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product.id, product.name)}
                    className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Eliminar referencia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="p-10 text-center text-xs text-stone-400">
          No hay referencias que coincidan con los filtros aplicados.
        </div>
      )}

      <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <span>
          Mostrando {visible.length} de {products.length} referencias
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 rounded-lg bg-white border border-stone-200 font-semibold text-stone-900">
            Pág. {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
