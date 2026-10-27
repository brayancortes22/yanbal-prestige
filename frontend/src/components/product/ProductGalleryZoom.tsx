import React, { useState } from 'react';
import { ZoomIn, Sparkles, ShieldCheck, Expand, Play } from 'lucide-react';
import type { Product } from '../../types';
import { resolveMediaList } from '../media/mediaUtils';
import { MediaFrame } from '../media/MediaFrame';
import { MediaViewer } from '../media/MediaViewer';

interface Props {
  product: Product;
}

/**
 * Galería de la ficha de producto: fotos con zoom óptico y videos de la
 * misma galería. Compatible con productos antiguos que solo tienen `image`.
 */
export const ProductGalleryZoom: React.FC<Props> = ({ product }) => {
  const items = resolveMediaList(product.media, product.image);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const active = items[Math.min(activeIndex, items.length - 1)];
  const isImage = active?.type !== 'video';

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isImage) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="space-y-4">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomPos(null)}
        className={`relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-sm select-none group ${
          isImage ? 'cursor-crosshair' : ''
        }`}
      >
        {active && (
          <MediaFrame
            item={active}
            alt={product.name}
            className={isImage && zoomPos ? 'transition-transform duration-150 ease-out will-change-transform' : ''}
          />
        )}

        {/* Zoom óptico solo para fotos */}
        {isImage && zoomPos && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${active?.url})`,
              backgroundSize: '220%',
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {product.badge && (
          <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-stone-900/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md">
            {product.badge}
          </span>
        )}

        {items.length > 1 && (
          <button
            type="button"
            onClick={() => setViewerIndex(activeIndex)}
            className="absolute bottom-4 right-4 z-10 p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 shadow-sm cursor-pointer"
            aria-label="Ver galería completa"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}

        {isImage && (
          <div className="absolute bottom-4 right-16 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-stone-700 text-[11px] font-semibold backdrop-blur-md shadow-sm border border-stone-100 group-hover:opacity-0 transition-opacity pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5 text-orange-600" />
            <span>Pasa el cursor para zoom</span>
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                index === activeIndex
                  ? 'border-orange-500'
                  : 'border-transparent hover:border-stone-300'
              }`}
              aria-label={`Ver recurso ${index + 1} de ${product.name}`}
            >
              {item.type === 'video' ? (
                <span className="w-full h-full bg-stone-900 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </span>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

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

      {viewerIndex !== null && (
        <MediaViewer
          media={items}
          index={viewerIndex}
          alt={product.name}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </div>
  );
};
