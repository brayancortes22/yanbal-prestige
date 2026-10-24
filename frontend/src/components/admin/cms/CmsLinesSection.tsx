import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { LineAccordionItem } from '../../../types';

export const CmsLinesSection: React.FC = () => {
  const { linesAccordion, saveLineAccordion } = useConfig();
  const [editingLine, setEditingLine] = useState<LineAccordionItem | null>(null);

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [claimsStr, setClaimsStr] = useState('');

  const handleOpenEdit = (line: LineAccordionItem) => {
    setEditingLine(line);
    setTitle(line.title);
    setTagline(line.tagline);
    setDescription(line.description);
    setImage(line.image);
    setClaimsStr(line.claims.join(', '));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLine) return;

    const claims = claimsStr.split(',').map((c) => c.trim()).filter(Boolean);
    saveLineAccordion({
      ...editingLine,
      title,
      tagline,
      description,
      image,
      claims: claims.length > 0 ? claims : editingLine.claims,
    });
    setEditingLine(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-editorial text-lg font-bold text-stone-900">Líneas Emblemáticas Yanbal</h3>
        <p className="text-xs text-stone-500">Edita los textos, claims clínicos y fotografías de las 4 colecciones destacadas.</p>
      </div>

      {editingLine && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="font-editorial text-sm font-bold text-stone-900">Editar Colección: {editingLine.title}</h4>
            <button type="button" onClick={() => setEditingLine(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Título de la línea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-bold"
            />
            <input
              type="text"
              required
              placeholder="Tagline / Subtítulo"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <input
            type="url"
            required
            placeholder="URL de la imagen"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <textarea
            rows={2}
            placeholder="Descripción..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">Beneficios Clínicos (separados por coma)</label>
            <input
              type="text"
              placeholder="Ej: SPF 100, Sin Residuo Blanco, Resistente al Agua"
              value={claimsStr}
              onChange={(e) => setClaimsStr(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingLine(null)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Colección</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {linesAccordion.map((line) => (
          <div key={line.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex gap-4 items-center">
            <img src={line.image} alt={line.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-orange-600 block">{line.tagline}</span>
              <h4 className="font-editorial text-sm font-bold text-stone-900 truncate">{line.title}</h4>
              <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{line.description}</p>
            </div>
            <button
              onClick={() => handleOpenEdit(line)}
              className="p-2 text-stone-500 hover:text-orange-600 rounded-lg hover:bg-orange-50 cursor-pointer"
              title="Editar línea"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
