import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

export const CmsAboutSection: React.FC = () => {
  const { aboutContent, setAboutContent } = useConfig();
  const [form, setForm] = useState(aboutContent);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAboutContent({ ...form, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-editorial text-lg font-bold text-stone-900">Sección "Quiénes Somos" & Misión de Equipo</h3>
        <p className="text-xs text-stone-500">Configura la historia, el propósito corporativo y el número de consultoras activas.</p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Información de "Quiénes Somos" actualizada en la web pública.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-stone-800 block mb-1">Misión de Equipo (Titular Principal)</label>
          <input
            type="text"
            value={form.missionTitle}
            onChange={(e) => setForm({ ...form, missionTitle: e.target.value })}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-editorial text-base"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-stone-800 block mb-1">Descripción de la Misión</label>
          <textarea
            rows={3}
            value={form.missionDesc}
            onChange={(e) => setForm({ ...form, missionDesc: e.target.value })}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Contador de Consultoras Activas</label>
            <input
              type="text"
              value={form.consultantsCountText}
              onChange={(e) => setForm({ ...form, consultantsCountText: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-bold text-orange-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1">Título Asesoría Fisiológica</label>
            <input
              type="text"
              value={form.adviceTitle}
              onChange={(e) => setForm({ ...form, adviceTitle: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-800 block mb-1">Descripción de Asesoría Fisiológica</label>
          <textarea
            rows={2}
            value={form.adviceDesc}
            onChange={(e) => setForm({ ...form, adviceDesc: e.target.value })}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios Institucionales</span>
        </button>
      </form>
    </div>
  );
};
