import React, { useState } from 'react';
import { Save, CheckCircle, BookOpen } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import { CmsAboutTimelineEditor } from './CmsAboutTimelineEditor';
import type { AboutContentConfig, AboutTimelineItem } from '../../../types';

const DEFAULT_TIMELINE: AboutTimelineItem[] = [
  { year: '1967', title: 'Nace Yanbal', text: 'Fundada con la visión de empoderar a la mujer a través de la venta directa y la alta cosmética en Latinoamérica.' },
  { year: '1979', title: 'Llegada a Colombia', text: 'Inicia operaciones en Colombia, transformando la vida y economía de miles de familias.' },
  { year: '2015', title: 'Innovación Botánica & Centros de I+D', text: 'Consolidación de centros de investigación cosmética en Francia y EE.UU., extrayendo el poder de la biodiversidad andina.' },
  { year: '2024+', title: 'Yanbal Prestige Digital', text: 'Nuestra red da el salto digital con asesoría cutánea personalizada, pedidos en línea y acompañamiento integral.' },
];

export const CmsAboutSection: React.FC = () => {
  const { aboutContent, setAboutContent } = useConfig();
  const [form, setForm] = useState<AboutContentConfig>({
    ...aboutContent,
    timeline: aboutContent.timeline && aboutContent.timeline.length > 0 ? aboutContent.timeline : DEFAULT_TIMELINE,
  });
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
        <h3 className="font-editorial text-lg font-bold text-stone-900">Sección "Quiénes Somos", Historia & Trayectoria</h3>
        <p className="text-xs text-stone-500">Configura la historia, misión corporativa, asesoría fisiológica y la línea de tiempo oficial.</p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Información de "Quiénes Somos" actualizada en la web pública.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
        {/* Historia e Introducción */}
        <div className="space-y-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Historia & Introducción</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Tag Superior</label>
              <input
                type="text"
                value={form.historyTag}
                onChange={(e) => setForm({ ...form, historyTag: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Título de la Sección</label>
              <input
                type="text"
                value={form.historyTitle}
                onChange={(e) => setForm({ ...form, historyTitle: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-editorial font-bold"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">Descripción de Quiénes Somos</label>
            <textarea
              rows={2}
              value={form.historyDesc}
              onChange={(e) => setForm({ ...form, historyDesc: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Misión de Equipo */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Misión de Equipo & Asesoría</h4>
          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">Titular Principal de Misión</label>
            <input
              type="text"
              value={form.missionTitle}
              onChange={(e) => setForm({ ...form, missionTitle: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-editorial text-base"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">Descripción de la Misión</label>
            <textarea
              rows={2}
              value={form.missionDesc}
              onChange={(e) => setForm({ ...form, missionDesc: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Contador Consultoras Activas</label>
              <input
                type="text"
                value={form.consultantsCountText}
                onChange={(e) => setForm({ ...form, consultantsCountText: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-bold text-orange-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">Título Asesoría Fisiológica</label>
              <input
                type="text"
                value={form.adviceTitle}
                onChange={(e) => setForm({ ...form, adviceTitle: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-700 block mb-1">Descripción Asesoría Fisiológica</label>
            <textarea
              rows={2}
              value={form.adviceDesc}
              onChange={(e) => setForm({ ...form, adviceDesc: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Editor de Línea de Tiempo */}
        <CmsAboutTimelineEditor
          timeline={form.timeline || []}
          onChange={(newTimeline) => setForm({ ...form, timeline: newTimeline })}
        />

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Cambios Institucionales</span>
        </button>
      </form>
    </div>
  );
};
