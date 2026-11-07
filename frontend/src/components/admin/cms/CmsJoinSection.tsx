import React, { useState } from 'react';
import { Save, CheckCircle, Sparkles, Crown } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';

export const CmsJoinSection: React.FC = () => {
  const { joinContent, setJoinContent } = useConfig();
  const [form, setForm] = useState(joinContent);
  const [consultantBenefitsText, setConsultantBenefitsText] = useState(
    (joinContent.consultantBenefits || []).join('\n')
  );
  const [directorBenefitsText, setDirectorBenefitsText] = useState(
    (joinContent.directorBenefits || []).join('\n')
  );
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cBenefits = consultantBenefitsText.split('\n').map((s) => s.trim()).filter(Boolean);
    const dBenefits = directorBenefitsText.split('\n').map((s) => s.trim()).filter(Boolean);

    setJoinContent({
      ...form,
      consultantBenefits: cBenefits,
      directorBenefits: dBenefits,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-editorial text-lg font-bold text-stone-900">
          Sección "Trabaja con Nosotros" & 3D Flip Cards de Liderazgo
        </h3>
        <p className="text-xs text-stone-500">
          Personaliza los textos de presentación, beneficios y llamados a la acción para los roles de Consultora y Líder.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Información de "Trabaja con Nosotros" actualizada exitosamente en la web pública.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        {/* Cabecera de la sección */}
        <div className="space-y-3 pb-4 border-b border-stone-100">
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Cabecera Pública</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Etiqueta Superior</label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Titular Principal</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-editorial text-base font-bold"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">Descripción General</label>
            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Rol 01: Consultora de Belleza */}
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/30 border border-orange-200/60 space-y-3">
          <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Rol 01: Consultora de Belleza Independiente</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Título del Rol</label>
              <input
                type="text"
                value={form.consultantTitle}
                onChange={(e) => setForm({ ...form, consultantTitle: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Texto del Botón</label>
              <input
                type="text"
                value={form.consultantButtonText}
                onChange={(e) => setForm({ ...form, consultantButtonText: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">Descripción del Rol</label>
            <textarea
              rows={2}
              value={form.consultantDesc}
              onChange={(e) => setForm({ ...form, consultantDesc: e.target.value })}
              className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">Beneficios Destacados (1 por línea)</label>
            <textarea
              rows={4}
              value={consultantBenefitsText}
              onChange={(e) => setConsultantBenefitsText(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white font-mono"
            />
          </div>
        </div>

        {/* Rol 02: Directora & Líder */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white border border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Crown className="w-4 h-4" />
            <span>Rol 02: Directora Independiente & Líder</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Título del Rol</label>
              <input
                type="text"
                value={form.directorTitle}
                onChange={(e) => setForm({ ...form, directorTitle: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-stone-700 bg-stone-800 text-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-300 block mb-1">Texto del Botón</label>
              <input
                type="text"
                value={form.directorButtonText}
                onChange={(e) => setForm({ ...form, directorButtonText: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-stone-700 bg-stone-800 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-stone-300 block mb-1">Descripción de Liderazgo</label>
            <textarea
              rows={2}
              value={form.directorDesc}
              onChange={(e) => setForm({ ...form, directorDesc: e.target.value })}
              className="w-full p-2 text-xs rounded-xl border border-stone-700 bg-stone-800 text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-stone-300 block mb-1">Beneficios de Red (1 por línea)</label>
            <textarea
              rows={4}
              value={directorBenefitsText}
              onChange={(e) => setDirectorBenefitsText(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-stone-700 bg-stone-800 text-white font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios de "Trabaja con Nosotros"</span>
        </button>
      </form>
    </div>
  );
};
