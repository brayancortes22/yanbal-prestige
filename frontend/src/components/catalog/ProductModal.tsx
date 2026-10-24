import React from 'react';
import { X, ShoppingBag, Sparkles, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const wpDirectLink = `https://wa.me/573000000000?text=${encodeURIComponent(
    `Hola! Me interesa conocer más y pedir el producto: ${product.name} ($${product.price.toLocaleString('es-CO')} COP) de Yanbal Prestige.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 relative animate-scaleIn">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          
          {/* Imagen */}
          <div className="sm:col-span-5 rounded-2xl overflow-hidden aspect-square bg-stone-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Info & Modo de Uso */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest block">
                {product.categoryLabel}
              </span>
              <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xl font-bold text-stone-900">
                  ${product.price.toLocaleString('es-CO')} COP
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                  Disponible
                </span>
              </div>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {product.description}
            </p>

            {/* SECCIÓN MODO DE USO REQUERIDA EN EL AUDIO */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Modo de Uso Recomendado:
              </span>
              <div className="space-y-1.5 text-xs text-stone-600">
                {product.usageSteps.map((step, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              {product.consultantTip && (
                <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-[11px] text-orange-950 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Tip de la Consultora:</strong> {product.consultantTip}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  addToCart(product);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Añadir al Carrito</span>
              </button>
              <a
                href={wpDirectLink}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
