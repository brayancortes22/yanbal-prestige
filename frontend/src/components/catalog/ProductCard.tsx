import React from 'react';
import { Plus, Eye, Ban } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.active === false;

  return (
    <div className={`product-card card-luxury rounded-3xl overflow-hidden flex flex-col justify-between group ${
      isOutOfStock ? 'opacity-70 grayscale-[25%]' : ''
    }`}>
      
      {/* Contenedor Imagen */}
      <div className="relative aspect-square bg-stone-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {isOutOfStock ? (
          <span className="absolute top-3 left-3 bg-amber-600/95 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            Agotado Temporalmente
          </span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {product.badge}
          </span>
        ) : null}

        {/* Botón Flotante Ver Ficha Rápida */}
        <button
          onClick={() => onOpenDetails(product)}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md backdrop-blur-sm opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
          title="Ver Ficha & Consejos"
        >
          <Eye className="w-4 h-4 text-orange-600" />
        </button>
      </div>

      {/* Info y Acciones */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">
            {product.categoryLabel}
          </span>
          <h3 className="font-editorial text-base sm:text-lg font-bold text-stone-900 mt-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            {product.originalPrice && (
              <span className="text-[11px] text-stone-400 line-through block">
                ${product.originalPrice.toLocaleString('es-CO')}
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-stone-900">
              ${product.price.toLocaleString('es-CO')} COP
            </span>
          </div>

          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-2 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold flex items-center gap-1 cursor-not-allowed"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Agotado</span>
            </button>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
