import React, { useState } from 'react';
import { AlertTriangle, Info, Link2, Plus } from 'lucide-react';
import type { MediaItem } from '../../types';
import { countMedia } from './mediaUtils';
import { MediaDropzone } from './MediaDropzone';
import { MediaThumb } from './MediaThumb';
import { useMediaLibrary } from '../../hooks/useMediaLibrary';

interface Props {
  media: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  accept?: 'image' | 'video' | 'any';
  maxFiles?: number;
  label?: string;
  hint?: string;
  showAlt?: boolean;
}

export const MediaUploader: React.FC<Props> = ({
  media,
  onChange,
  accept = 'any',
  maxFiles = 10,
  label = 'Fotos y videos',
  hint,
  showAlt = true,
}) => {
  const { addFiles, addUrl, remove, move, setCover, error, clearError } = useMediaLibrary(
    media,
    onChange,
    { accept, maxFiles }
  );
  const [urlDraft, setUrlDraft] = useState('');
  const counts = countMedia(media);
  const hasDemoFiles = media.some((item) => item.demo);

  // Este bloque vive dentro del formulario del producto/tip/evento, así que
  // no puede ser un <form> anidado: un Enter aquí no debe guardar el registro.
  const submitUrl = () => {
    addUrl(urlDraft);
    setUrlDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {label}
          </span>
          {hint && <span className="text-[11px] text-stone-400">{hint}</span>}
        </div>
        {media.length > 0 && (
          <span className="text-[11px] font-semibold text-stone-500">
            {counts.images} foto{counts.images === 1 ? '' : 's'} · {counts.videos} video
            {counts.videos === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <MediaDropzone accept={accept} onFiles={addFiles} compact={media.length > 0} />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="url"
            value={urlDraft}
            onChange={(event) => {
              setUrlDraft(event.target.value);
              clearError();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitUrl();
              }
            }}
            placeholder="https://... (enlace permanente a una foto o video)"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={submitUrl}
          disabled={!urlDraft.trim()}
          className="px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((item, index) => (
            <MediaThumb
              key={item.id}
              item={item}
              index={index}
              total={media.length}
              onRemove={remove}
              onMove={move}
              onSetCover={setCover}
              onAltChange={
                showAlt
                  ? (id, alt) =>
                      onChange(media.map((m) => (m.id === id ? { ...m, alt } : m)))
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {hasDemoFiles && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Modo demostración:</strong> los archivos marcados como «Sesión» se ven al
            instante pero viven solo en este navegador y desaparecen al recargar. Los enlaces sí
            quedan guardados.
          </span>
        </div>
      )}
    </div>
  );
};
