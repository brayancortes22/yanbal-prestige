import React from 'react';
import { Tag, Copy, Check, Lightbulb } from 'lucide-react';
import type { Product } from '../../types';

interface ConsultantCatalogTableProps {
  products: Product[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onCopyQuote: (product: Product) => void;
  copiedQuoteId: string | null;
}

export const ConsultantCatalogTable: React.FC<ConsultantCatalogTableProps> = ({
  products,
  copiedCode,
  onCopyCode,
  onCopyQuote,
  copiedQuoteId,
}) => {
  return (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full text-xs text-left">
        <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 backdrop-blur font-semibold text-stone-500 shadow-2xs">
          <tr>
            <th className="py-3 px-4">Producto</th>
            <th className="py-3 px-4">Código SKU</th>
            <th className="py-3 px-4">Categoría</th>
            <th className="py-3 px-4 text-right">Precio Oficial</th>
            <th className="py-3 px-4">Tip de Asesoría</th>
            <th className="py-3 px-4 text-center">Cotizar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-stone-400">
                No se encontraron productos con ese código o nombre.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const isCodeCopied = copiedCode === product.code;
              const isQuoteCopied = copiedQuoteId === product.id;

              return (
                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200/80 shrink-0 bg-stone-100"
                      />
                      <div className="min-w-0 max-w-xs">
                        <span className="font-semibold text-stone-900 block truncate" title={product.name}>
                          {product.name}
                        </span>
                        {product.badge && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-orange-100 text-orange-800">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onCopyCode(product.code)}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-800 font-mono text-xs font-bold transition-colors cursor-pointer"
                      title="Haz clic para copiar SKU"
                    >
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{product.code}</span>
                      {isCodeCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                      ) : (
                        <Copy className="w-3 h-3 text-amber-400 group-hover:text-amber-700 ml-0.5" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium">
                      {product.categoryLabel || product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="font-editorial text-sm font-bold text-stone-900">
                      ${product.price.toLocaleString('es-CO')}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-stone-400 line-through block">
                        ${product.originalPrice.toLocaleString('es-CO')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    {product.consultantTip ? (
                      <div className="flex items-start gap-1.5 text-[11px] text-stone-600 line-clamp-2" title={product.consultantTip}>
                        <Lightbulb className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span>{product.consultantTip}</span>
                      </div>
                    ) : (
                      <span className="text-stone-300 italic text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onCopyQuote(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                        isQuoteCopied
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                      }`}
                      title="Copiar texto listo para enviar por WhatsApp"
                    >
                      {isQuoteCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Cotizar</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
