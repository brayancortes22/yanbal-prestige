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
    <div className="p-4 rounded-2xl bg-orange-50/20 border border-stone-200 space-y-4">
      <div className="flex items-center gap-2 text-stone-900 border-b border-stone-100 pb-2">
        <Sparkles className="w-4 h-4 text-orange-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Personalización de Ficha de Producto (PDP) & Claims
        </h4>
      </div>

      {/* Badges Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" /> Tarjeta Botánica (Título / Bajada)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Fórmula Botánica"
              value={botanicalTitle}
              onChange={(e) => setBotanicalTitle(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-white"
            />
            <input
              type="text"
              placeholder="Ingredientes activos puros"
              value={botanicalDesc}
              onChange={(e) => setBotanicalDesc(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tarjeta Garantía (Título / Bajada)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="100% Original Yanbal"
              value={warrantyTitle}
              onChange={(e) => setWarrantyTitle(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-white"
            />
            <input
              type="text"
              placeholder="Garantía oficial de fábrica"
              value={warrantyDesc}
              onChange={(e) => setWarrantyDesc(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Modo de Uso, Consejo y Compromiso */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-orange-600" /> Modo de Uso (1 paso por línea)
          </label>
          <textarea
            rows={3}
            placeholder="Paso 1: Limpia tu rostro...&#10;Paso 2: Aplica 2 gotas..."
            value={usageStepsText}
            onChange={(e) => setUsageStepsText(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-600" /> Consejo de Belleza de Consultora
          </label>
          <textarea
            rows={3}
            placeholder="Consejo personalizado de aplicación..."
            value={consultantTip}
            onChange={(e) => setConsultantTip(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-emerald-600" /> Compromiso de Marca
          </label>
          <textarea
            rows={3}
            placeholder="Fórmulas no testeadas en animales (Cruelty-Free)..."
            value={commitmentText}
            onChange={(e) => setCommitmentText(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white resize-none"
          />
        </div>
      </div>
    </div>
  );
};
