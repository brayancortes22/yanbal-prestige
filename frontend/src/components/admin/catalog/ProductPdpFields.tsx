import React from 'react';
import { Sparkles, ShieldCheck, Leaf, Lightbulb, HeartHandshake } from 'lucide-react';

interface Props {
  botanicalTitle: string;
  setBotanicalTitle: (v: string) => void;
  botanicalDesc: string;
  setBotanicalDesc: (v: string) => void;
  warrantyTitle: string;
  setWarrantyTitle: (v: string) => void;
  warrantyDesc: string;
  setWarrantyDesc: (v: string) => void;
  usageStepsText: string;
  setUsageStepsText: (v: string) => void;
  consultantTip: string;
  setConsultantTip: (v: string) => void;
  commitmentText: string;
  setCommitmentText: (v: string) => void;
}

const inputClass =
  'w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs focus:border-orange-400 focus:outline-none';

/**
 * Campos de la ficha pública (PDP). Antes los títulos y bajadas iban
 * comprimidos en dos columnas sin explicación; ahora cada tarjeta muestra
 * qué texto se verá en la web y una vista previa del resultado.
 */
export const ProductPdpFields: React.FC<Props> = ({
  botanicalTitle,
  setBotanicalTitle,
  botanicalDesc,
  setBotanicalDesc,
  warrantyTitle,
  setWarrantyTitle,
  warrantyDesc,
  setWarrantyDesc,
  usageStepsText,
  setUsageStepsText,
  consultantTip,
  setConsultantTip,
  commitmentText,
  setCommitmentText,
}) => {
  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-orange-50/20 p-4">
      <div className="border-b border-stone-200/70 pb-2">
        <div className="flex items-center gap-2 text-stone-900">
          <Sparkles className="h-4 w-4 text-orange-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Ficha pública del producto (PDP)
          </h4>
        </div>
        <p className="mt-1 text-[11px] text-stone-500">
          Esto es lo que verá la clienta en la página del producto: tarjetas de confianza, modo de
          uso y consejo de tu consultora.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Tarjeta botánica */}
        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-white p-3">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
            <Leaf className="h-3.5 w-3.5" /> Tarjeta botánica
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-[10px] font-semibold text-stone-500">
              Título
              <input
                type="text"
                placeholder="Fórmula Botánica"
                value={botanicalTitle}
                onChange={(e) => setBotanicalTitle(e.target.value)}
                className={`mt-0.5 ${inputClass}`}
              />
            </label>
            <label className="text-[10px] font-semibold text-stone-500">
              Bajada
              <input
                type="text"
                placeholder="Ingredientes activos puros"
                value={botanicalDesc}
                onChange={(e) => setBotanicalDesc(e.target.value)}
                className={`mt-0.5 ${inputClass}`}
              />
            </label>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-[11px] text-emerald-900">
                {botanicalTitle || 'Fórmula Botánica'}
              </strong>
              <span className="block truncate text-[10px] text-emerald-700">
                {botanicalDesc || 'Ingredientes activos puros'}
              </span>
            </span>
          </div>
        </div>

        {/* Tarjeta garantía */}
        <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-stone-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Tarjeta de garantía
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-[10px] font-semibold text-stone-500">
              Título
              <input
                type="text"
                placeholder="100% Original Yanbal"
                value={warrantyTitle}
                onChange={(e) => setWarrantyTitle(e.target.value)}
                className={`mt-0.5 ${inputClass}`}
              />
            </label>
            <label className="text-[10px] font-semibold text-stone-500">
              Bajada
              <input
                type="text"
                placeholder="Garantía oficial de fábrica"
                value={warrantyDesc}
                onChange={(e) => setWarrantyDesc(e.target.value)}
                className={`mt-0.5 ${inputClass}`}
              />
            </label>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-[11px] text-stone-900">
                {warrantyTitle || '100% Original Yanbal'}
              </strong>
              <span className="block truncate text-[10px] text-stone-500">
                {warrantyDesc || 'Garantía oficial de fábrica'}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700">
            <Leaf className="h-3 w-3 text-orange-600" /> Modo de uso
          </label>
          <textarea
            rows={4}
            placeholder={'Paso 1: Limpia tu rostro...\nPaso 2: Aplica 2 gotas...'}
            value={usageStepsText}
            onChange={(e) => setUsageStepsText(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <p className="text-[10px] text-stone-400">Un paso por línea.</p>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700">
            <Lightbulb className="h-3 w-3 text-amber-600" /> Consejo de la consultora
          </label>
          <textarea
            rows={4}
            placeholder="Consejo personalizado de aplicación..."
            value={consultantTip}
            onChange={(e) => setConsultantTip(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <p className="text-[10px] text-stone-400">Aparece como recomendación experta.</p>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700">
            <HeartHandshake className="h-3 w-3 text-emerald-600" /> Compromiso de marca
          </label>
          <textarea
            rows={4}
            placeholder="Fórmulas no testeadas en animales (Cruelty-Free)..."
            value={commitmentText}
            onChange={(e) => setCommitmentText(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <p className="text-[10px] text-stone-400">Se muestra al final de la ficha.</p>
        </div>
      </div>
    </section>
  );
};
