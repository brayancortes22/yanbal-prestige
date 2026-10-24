import React, { useState } from 'react';
import { ZoomIn, Sparkles, ShieldCheck } from 'lucide-react';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export const ProductGalleryZoom: React.FC<Props> = ({ product }) => {
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleMouseLeave = () => {
    setZoomPos(null);
  };

  return (
    <div className="space-y-4">
      {/* Contenedor Principal con Zoom Óptico en Hover */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-sm cursor-crosshair select-none group"
      >
        <img
          src={product.image}
          alt={product.name}
          style={
            zoomPos
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: 'scale(2.2)',
                }
              : { transform: 'scale(1)' }
          }
          className="w-full h-full object-cover transition-transform duration-150 ease-out will-change-transform"
        />

        {/* Badge flotante de producto */}
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-stone-900/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
            {product.badge}
          </span>
        )}

        {/* Indicador de ayuda para zoom */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-stone-700 text-[11px] font-semibold backdrop-blur-md shadow-sm border border-stone-100 group-hover:opacity-0 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5 text-orange-600" />
          <span>Pasa el cursor para zoom</span>
        </div>
      </div>

      {/* Sellos de Calidad y Autenticidad */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-100/70 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-stone-900 block">Fórmula Botánica</span>
            <span className="text-[10px] text-stone-500">Ingredientes activos puros</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-stone-900 block">100% Original Yanbal</span>
            <span className="text-[10px] text-stone-500">Garantía oficial de fábrica</span>
          </div>
        </div>
      </div>
    </div>
  );
};
