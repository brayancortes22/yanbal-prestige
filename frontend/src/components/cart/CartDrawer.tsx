import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
    generateWhatsAppLink
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header del Carrito */}
          <div className="px-6 py-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Tu Pedido ({totalItems})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Productos */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-editorial text-lg font-bold text-stone-800">
                  Tu carrito está vacío
                </h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explora el catálogo y añade tus productos favoritos para armar tu rutina con asesoría personalizada.
                </p>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 rounded-2xl border border-stone-100 hover:border-orange-200 bg-stone-50/50 transition-all"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-white"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 block mt-0.5">
                        ${product.price.toLocaleString('es-CO')} COP
                      </span>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-0.5 text-stone-600 hover:text-orange-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-stone-800 w-4 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-0.5 text-stone-600 hover:text-orange-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-800">
                        ${(product.price * quantity).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer del Carrito & Checkout a WhatsApp */}
          {cart.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-editorial text-xl font-bold text-stone-900">
                  ${totalPrice.toLocaleString('es-CO')} COP
                </span>
              </div>
              <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Envío y asesoría directa coordinados con tu Consultora de Belleza.</span>
              </p>

              <div className="space-y-2">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Pedir por WhatsApp a mi Consultora</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-[11px] font-medium text-stone-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
