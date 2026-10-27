import React, { useState } from 'react';
import { Images, Play, Expand } from 'lucide-react';
import type { MediaItem } from '../../types';
import { countMedia, resolveCover, resolveMediaList } from './mediaUtils';
import { MediaFrame } from './MediaFrame';
import { MediaViewer } from './MediaViewer';

interface Props {
  media?: MediaItem[];
  fallback: string;
  alt: string;
  variant?: 'detail' | 'compact';
  /** Clase de proporción para el marco principal, por defecto cuadrada. */
  aspect?: string;
  className?: string;
}

/**
 * Galería pública reutilizable.
 * - `detail`: imagen principal + miniaturas (ficha de producto, artículo de tip).
 * - `compact`: portada con contador y visor a pantalla completa (tarjetas de evento).
 */
export const MediaGallery: React.FC<Props> = ({
  media,
  fallback,
  alt,
  variant = 'detail',
  aspect = 'aspect-square',
  className = '',
}) => {
  const items = resolveMediaList(media, fallback);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const counts = countMedia(items);
  const cover = resolveCover(media, fallback);
  const hasGallery = items.length > 1 || items[0]?.type === 'video';

  if (items.length === 0) {
    return (
      <div className={`aspect-square rounded-3xl bg-stone-100 border border-stone-200 ${className}`} />
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setViewerIndex(0)}
          className={`relative block w-full h-full group cursor-pointer ${className}`}
          aria-label={`Abrir galería de ${alt}`}
        >
          <img src={cover} alt={alt} loading="lazy" className="w-full h-full object-cover" />

          <span className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <span className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-900/80 text-white text-[10px] font-semibold">
            {counts.videos > 0 ? <Play className="w-3 h-3" /> : <Images className="w-3 h-3" />}
            {items.length}
          </span>

          {hasGallery && (
            <span className="absolute inset-x-2 bottom-2 hidden sm:flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/90 text-stone-800 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="w-3 h-3" /> Ver galería
            </span>
          )}
        </button>

        {viewerIndex !== null && (
          <MediaViewer
            media={items}
            index={viewerIndex}
            alt={alt}
            onClose={() => setViewerIndex(null)}
            onNavigate={setViewerIndex}
          />
        )}
      </>
    );
  }

  const active = items[Math.min(activeIndex, items.length - 1)];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`relative ${aspect} w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-sm`}>
        <MediaFrame item={active} alt={alt} />

        {hasGallery && (
          <button
            type="button"
            onClick={() => setViewerIndex(activeIndex)}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-stone-800 shadow-sm cursor-pointer"
            aria-label="Ver en pantalla completa"
          >
            <Expand className="w-4 h-4" />
          </button>
        )}

        {counts.videos > 0 && active.type !== 'video' && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-stone-900/80 text-white text-[10px] font-semibold flex items-center gap-1">
            <Play className="w-3 h-3" /> Video
          </span>
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
              aria-label={`Ver recurso ${index + 1}`}
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

      {viewerIndex !== null && (
        <MediaViewer
          media={items}
          index={viewerIndex}
          alt={alt}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </div>
  );
};
