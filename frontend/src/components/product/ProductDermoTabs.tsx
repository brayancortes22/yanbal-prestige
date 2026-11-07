import React from 'react';
import { Sparkles, CheckCircle2, Lightbulb, HeartHandshake, ShieldCheck, Leaf } from 'lucide-react';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export const ProductDermoTabs: React.FC<Props> = ({ product }) => {
  const botanicalTitle = product.botanicalTitle || 'Fórmula Botánica';
  const botanicalDesc = product.botanicalDesc || 'Ingredientes activos puros';
  const warrantyTitle = product.warrantyTitle || '100% Original Yanbal';
  const warrantyDesc = product.warrantyDesc || 'Garantía oficial de fábrica';
  const commitmentTitle = product.commitmentTitle || 'Compromiso Yanbal Prestige';
  const commitmentText = product.commitmentText || 'Fórmulas no testeadas en animales (Cruelty-Free), hipoalergénicas y enriquecidas con extractos botánicos de la biodiversidad andina.';

  const defaultSteps = [
    'Paso 1: Limpia tu rostro en la mañana y en la noche con gel o espuma suave.',
    'Paso 2: Aplica de 2 a 3 gotas en pómulos, frente y cuello.',
    'Paso 3: Realiza masajes ascendentes desde el centro hacia afuera hasta su absorción completa.'
  ];
  const steps = product.usageSteps && product.usageSteps.length > 0 ? product.usageSteps : defaultSteps;

  return (
    <div className="space-y-6 pt-10 border-t border-stone-200/70">
      {/* 1. Tarjetas Superiores de Fórmula Botánica y Garantía Oficial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/40 border border-orange-200/60 flex items-center gap-3.5 transition-all hover:border-orange-300">
          <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">{botanicalTitle}</h4>
            <p className="text-xs text-stone-500">{botanicalDesc}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 flex items-center gap-3.5 transition-all hover:border-emerald-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">{warrantyTitle}</h4>
            <p className="text-xs text-stone-500">{warrantyDesc}</p>
          </div>
        </div>
      </div>

      {/* 2. Modo de Uso Clínico y Consejos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-orange-600" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Modo de Uso Recomendado
            </h3>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-stone-600 bg-stone-50/60 p-3 rounded-2xl border border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <Lightbulb className="w-4 h-4" />
              <h4 className="font-editorial text-base font-bold">Consejo de Belleza de tu Consultora</h4>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "{product.consultantTip || 'Aplica antes de tu crema hidratante y nunca olvides tu protector solar de día.'}"
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-stone-900">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <h4 className="font-editorial text-base font-bold">{commitmentTitle}</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              {commitmentText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
