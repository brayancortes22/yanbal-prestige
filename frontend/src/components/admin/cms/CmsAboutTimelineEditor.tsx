import React from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import type { AboutTimelineItem } from '../../../types';

interface CmsAboutTimelineEditorProps {
  timeline: AboutTimelineItem[];
  onChange: (timeline: AboutTimelineItem[]) => void;
}

export const CmsAboutTimelineEditor: React.FC<CmsAboutTimelineEditorProps> = ({
  timeline,
  onChange,
}) => {
  const handleItemChange = (index: number, field: keyof AboutTimelineItem, value: string) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAddHito = () => {
    onChange([
      ...timeline,
      {
        year: `${new Date().getFullYear()}`,
        title: 'Nuevo Hito Institucional',
        text: 'Descripción de la expansión, logro o reconocimiento alcanzado por la red.',
      },
    ]);
  };

  const handleRemoveHito = (index: number) => {
    onChange(timeline.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 pt-2 border-t border-stone-200/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-600" />
          <label className="text-xs font-bold text-stone-800">Línea de Tiempo / Trayectoria Yanbal</label>
        </div>
        <button
          type="button"
          onClick={handleAddHito}
          className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Año / Hito</span>
        </button>
      </div>

      <div className="space-y-3">
        {timeline.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-2 relative group hover:border-orange-200 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Año (ej. 1967)"
                  value={item.year}
                  onChange={(e) => handleItemChange(idx, 'year', e.target.value)}
                  className="w-24 p-1.5 text-xs font-bold text-orange-600 rounded-lg border border-stone-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Título del Hito"
                  value={item.title}
                  onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                  className="flex-1 p-1.5 text-xs font-semibold text-stone-800 rounded-lg border border-stone-200 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveHito(idx)}
                title="Eliminar hito"
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Descripción del hito histórico..."
              value={item.text}
              onChange={(e) => handleItemChange(idx, 'text', e.target.value)}
              className="w-full p-2 text-xs text-stone-600 rounded-lg border border-stone-200 bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
