import React, { useState } from 'react';
import { Tag, Plus, Minus, ShoppingBag, MessageCircle, Truck, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export const ProductPurchaseBox: React.FC<Props> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isOutOfStock = product.active === false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const wpMsg = encodeURIComponent(
    `Hola Directora Yuli! Me interesa comprar el producto: "${product.name}" (Código SKU: ${product.code}) por un valor de $${product.price.toLocaleString('es-CO')} COP que vi en Yanbal Prestige.`
  );

  return (
    <div className="space-y-6">
      
      {/* Código SKU & Categoría */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-600" />
            <span>SKU: {product.code}</span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            {product.categoryLabel}
          </span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
          {product.name}
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
          {product.description}
        </p>
      </div>

      {/* Precios */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-baseline gap-3">
        <span className="text-2xl sm:text-3xl font-bold text-stone-900">
          ${product.price.toLocaleString('es-CO')} COP
        </span>
        {product.originalPrice && (
          <span className="text-sm text-stone-400 line-through">
            ${product.originalPrice.toLocaleString('es-CO')} COP
          </span>
        )}
        <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {isOutOfStock ? 'Pausado' : 'Disponible'}
        </span>
      </div>

      {/* Selector de Cantidad & Botón Carrito */}
      {!isOutOfStock ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-stone-200 rounded-2xl bg-white shadow-xs p-1">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors"
                title="Reducir cantidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors"
                title="Aumentar cantidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-6 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-[1.01]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Añadido ({quantity})!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir al Carrito</span>
                </>
              )}
            </button>
          </div>

          {/* Botón WhatsApp Directo */}
          <a
            href={`https://wa.me/573000000000?text=${wpMsg}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Pedir Asesoría Directa por WhatsApp</span>
          </a>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
          Esta referencia se encuentra pausada o agotada temporalmente en campaña.
        </div>
      )}

      {/* Reaseguros de compra */}
      <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-stone-400" />
          <span>Envíos a toda Colombia • Gratis por compras desde $150.000 COP</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-stone-400" />
          <span>Pago contra entrega o transferencia directa con tu consultora</span>
        </div>
      </div>

    </div>
  );
};
