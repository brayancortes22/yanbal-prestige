import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Power, Star, ExternalLink, Video } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { TipItem } from '../../../types';
import { TipForm } from './TipForm';
import { formatTipDate } from '../../tips/tipUtils';

export const CmsTipsSection: React.FC = () => {
  const { tips, saveTip, toggleTip, deleteTip } = useConfig();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<TipItem | null>(null);

  const ordered = [...tips].sort((a, b) => a.order - b.order);
  const published = ordered.filter((tip) => tip.active).length;

  const openCreate = () => {
    setEditingTip(null);
    setIsFormOpen(true);
  };

  const openEdit = (tip: TipItem) => {
    setEditingTip(tip);
    setIsFormOpen(true);
  };

  const handleSave = (tip: TipItem) => {
    saveTip(tip);
    setIsFormOpen(false);
    setEditingTip(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-editorial text-lg font-bold text-stone-900">Tips & Consejos</h3>
          <p className="text-xs text-stone-500">
            Publica artículos con foto o video. Se muestran en la vista pública /tips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-[11px] font-semibold text-stone-600">
            {published} publicado{published === 1 ? '' : 's'} · {ordered.length} en total
          </span>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo consejo</span>
          </button>
        </div>
      </div>

      {isFormOpen && (
        <TipForm
          tip={editingTip}
          nextOrder={ordered.length + 1}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTip(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ordered.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex gap-4"
          >
            <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-stone-100">
              <img src={tip.image} alt={tip.title} className="w-full h-full object-cover" />
              {tip.videoUrl && (
                <span className="absolute bottom-1 right-1 p-1 rounded bg-stone-900/85 text-white">
                  <Video className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold">
                    {tip.category}
                  </span>
                  {tip.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  <span className="text-[10px] text-stone-400">
                    {formatTipDate(tip.createdAt)}
                  </span>
                </div>

                <h4 className="font-editorial text-sm font-bold text-stone-900 truncate">
                  {tip.title}
                </h4>
                <p className="text-[11px] text-stone-500 line-clamp-2">{tip.summary}</p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => toggleTip(tip.id)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 cursor-pointer ${
                    tip.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-stone-100 text-stone-500 border-stone-200'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{tip.active ? 'Visible' : 'Oculto'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={`/tips/${tip.id}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Ver en el sitio"
                    className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openEdit(tip)}
                    title="Editar"
                    className="p-1 text-stone-400 hover:text-orange-600 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar el consejo "${tip.title}"?`)) deleteTip(tip.id);
                    }}
                    title="Eliminar"
                    className="p-1 text-stone-300 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ordered.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-stone-300 text-xs text-stone-400">
          Aún no hay consejos. Crea el primero con el botón «Nuevo consejo».
        </div>
      )}
    </div>
  );
};
