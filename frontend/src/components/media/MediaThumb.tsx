import React from 'react';
import { ArrowLeft, ArrowRight, Star, Trash2, Play } from 'lucide-react';
import type { MediaItem } from '../../types';

interface Props {
  item: MediaItem;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onSetCover: (id: string) => void;
  onAltChange?: (id: string, alt: string) => void;
}

export const MediaThumb: React.FC<Props> = ({
  item,
  index,
  total,
  onRemove,
  onMove,
  onSetCover,
  onAltChange,
}) => {
  const isCover = index === 0;

  return (
    <div className="group space-y-1.5">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
        {item.type === 'video' ? (
          <>
            <video
              src={item.url}
              poster={item.poster}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-stone-900/25">
              <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-stone-900 ml-0.5" />
              </span>
            </span>
          </>
        ) : (
          <img src={item.url} alt={item.alt || ''} className="w-full h-full object-cover" />
        )}

        {isCover && (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-stone-900/85 text-white text-[9px] font-bold uppercase tracking-wide">
            Portada
          </span>
        )}

        {item.demo && (
          <span
            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-500/95 text-white text-[9px] font-bold"
            title="Vista previa de esta sesión: no se guarda al recargar"
          >
            Sesión
          </span>
        )}

        <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onMove(item.id, -1)}
            disabled={index === 0}
            title="Mover a la izquierda"
            className="p-1.5 rounded-lg bg-white/95 text-stone-700 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onSetCover(item.id)}
            disabled={isCover}
            title="Usar como portada"
            className="p-1.5 rounded-lg bg-white/95 text-stone-700 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <Star className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onMove(item.id, 1)}
            disabled={index === total - 1}
            title="Mover a la derecha"
            className="p-1.5 rounded-lg bg-white/95 text-stone-700 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            title="Quitar de la galería"
            className="p-1.5 rounded-lg bg-white/95 text-stone-400 hover:text-red-600 cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {onAltChange && (
        <input
          type="text"
          value={item.alt ?? ''}
          onChange={(event) => onAltChange(item.id, event.target.value)}
          placeholder="Texto alternativo (SEO)"
          className="w-full px-2 py-1 text-[10px] rounded-lg border border-stone-200 bg-white text-stone-600 placeholder:text-stone-400"
        />
      )}
    </div>
  );
};
