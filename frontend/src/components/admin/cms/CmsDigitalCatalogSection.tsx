import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

export const CmsDigitalCatalogSection: React.FC = () => {
  const { digitalCatalog, setDigitalCatalog } = useConfig();
  const [form, setForm] = useState(digitalCatalog);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDigitalCatalog(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-editorial text-lg font-bold text-stone-900">Banner de Catálogo Digital Interactivo</h3>
        <p className="text-xs text-stone-500">Configura la portada de la revista y los textos de la campaña vigente.</p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Información de catálogo digital guardada con éxito.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Badge de Campaña</label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Resalte del Título</label>
            <input
              type="text"
              value={form.titleHighlight}
              onChange={(e) => setForm({ ...form, titleHighlight: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-serif italic text-orange-600"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-800 block mb-1">Descripción del Catálogo</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Texto de Edición</label>
            <input
              type="text"
              value={form.specialEditionText}
              onChange={(e) => setForm({ ...form, specialEditionText: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Descuento Promocional</label>
            <input
              type="text"
              value={form.discountText}
              onChange={(e) => setForm({ ...form, discountText: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">URL Portada Revista</label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Actualizar Catálogo Digital</span>
        </button>
      </form>
    </div>
  );
};
