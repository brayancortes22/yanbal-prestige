import React, { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import type { MediaItem, TipCategory, TipItem } from '../../../types';
import { MediaUploader } from '../../media/MediaUploader';

const CATEGORIES: TipCategory[] = ['Rutina', 'Cuidado', 'Maquillaje', 'Negocio'];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80';

interface Props {
  tip: TipItem | null;
  nextOrder: number;
  onSave: (tip: TipItem) => void;
  onCancel: () => void;
}

export const TipForm: React.FC<Props> = ({ tip, nextOrder, onSave, onCancel }) => {
  const [title, setTitle] = useState(tip?.title ?? '');
  const [summary, setSummary] = useState(tip?.summary ?? '');
  const [category, setCategory] = useState<TipCategory>(tip?.category ?? 'Rutina');
  const [content, setContent] = useState(tip?.content ?? '');
  const [author, setAuthor] = useState(tip?.author ?? 'Yuli Cortés');
  const [featured, setFeatured] = useState(tip?.featured ?? false);
  const [imageMedia, setImageMedia] = useState<MediaItem[]>(
    tip?.image ? [{ id: 'cover', url: tip.image, type: 'image', alt: tip.title }] : []
  );
  const [videoMedia, setVideoMedia] = useState<MediaItem[]>(
    tip?.videoUrl ? [{ id: 'video', url: tip.videoUrl, type: 'video' }] : []
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (content.trim().length < 40) {
      setError('El contenido debe tener al menos 40 caracteres para que el artículo aporte valor.');
      return;
    }

    const now = new Date().toISOString();

    onSave({
      id: tip?.id ?? `tip-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category,
      author: author.trim() || 'Equipo Yanbal Prestige',
      image: imageMedia[0]?.url || FALLBACK_IMAGE,
      videoUrl: videoMedia[0]?.url || undefined,
      featured,
      order: tip?.order ?? nextOrder,
      active: tip?.active ?? true,
      createdAt: tip?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <h4 className="font-editorial text-sm font-bold text-stone-900">
          {tip ? 'Editar consejo' : 'Publicar nuevo consejo'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          placeholder="Título del consejo"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as TipCategory)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-semibold"
        >
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <textarea
        rows={2}
        placeholder="Resumen corto que se ve en la tarjeta (1 o 2 frases)"
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Autora del consejo"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <label className="flex items-center gap-2 px-3 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-semibold text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="accent-orange-600"
          />
          Destacar en la parte superior
        </label>
      </div>

      <textarea
        rows={8}
        required
        placeholder={
          'Contenido del artículo.\n\nSepara los párrafos con una línea en blanco.\n- Usa guion para crear listas\n- Una línea por punto'
        }
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="w-full p-3 text-xs rounded-xl border border-stone-200 bg-stone-50/50 leading-relaxed"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50/40">
          <MediaUploader
            media={imageMedia}
            onChange={setImageMedia}
            accept="image"
            maxFiles={1}
            label="Imagen de portada"
            hint="Una sola foto, horizontal (1200 × 750 px ideal)"
            showAlt={false}
          />
        </div>

        <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50/40">
          <MediaUploader
            media={videoMedia}
            onChange={setVideoMedia}
            accept="video"
            maxFiles={1}
            label="Video del consejo (opcional)"
            hint="Archivo MP4/WebM o enlace de YouTube/Vimeo"
            showAlt={false}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Guardar consejo</span>
        </button>
      </div>
    </form>
  );
};
