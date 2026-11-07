import React, { useState } from 'react';
import { ZoomIn, Expand, Play } from 'lucide-react';
import type { Product } from '../../types';
import { resolveMediaList } from '../media/mediaUtils';
import { MediaFrame } from '../media/MediaFrame';
import { MediaViewer } from '../media/MediaViewer';

interface Props {
  product: Product;
}

/**
 * Galería de la ficha de producto: miniaturas al costado izquierdo (estilo
 * Mercado Libre) para cambiar entre fotos y videos, con zoom óptico en la
 * imagen activa. En móvil las miniaturas pasan debajo de la foto.
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      {/* Miniaturas: vertical en escritorio, horizontal en móvil */}
      {items.length > 1 && (
        <div className="order-2 flex shrink-0 items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:order-1 sm:w-20 sm:flex-col sm:overflow-visible sm:pb-0">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setZoomPos(null);
              }}
              className={`relative shrink-0 w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                index === activeIndex
                  ? 'border-orange-500 shadow-sm'
                  : 'border-stone-200 hover:border-stone-400'
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
              {item.type === 'video' && (
                <span className="absolute bottom-1 right-1 rounded bg-stone-950/80 px-1 text-[9px] font-bold text-white">
                  Video
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="order-1 flex-1 space-y-4 sm:order-2">
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

          {items.length > 1 && (
            <span className="absolute left-4 bottom-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-stone-600 shadow-sm">
              {activeIndex + 1} / {items.length}
            </span>
          )}
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
