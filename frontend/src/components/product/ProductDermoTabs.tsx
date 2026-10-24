import React from 'react';
import { Sparkles, CheckCircle2, Lightbulb, HeartHandshake } from 'lucide-react';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export const ProductDermoTabs: React.FC<Props> = ({ product }) => {
  return (
    <div className="space-y-6 pt-10 border-t border-stone-200/70">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Modo de Uso Clínico */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <h3 className="font-editorial text-lg font-bold text-stone-900">
              Modo de Uso Recomendado
            </h3>
          </div>

          <div className="space-y-3">
            {product.usageSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-stone-600 bg-stone-50/60 p-3 rounded-2xl border border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip de la Consultora & Compromiso Yanbal */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <Lightbulb className="w-4 h-4" />
              <h4 className="font-editorial text-base font-bold">Consejo de Belleza de tu Consultora</h4>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed italic">
              "{product.consultantTip}"
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-stone-900">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <h4 className="font-editorial text-base font-bold">Compromiso Yanbal Prestige</h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Fórmulas no testeadas en animales (Cruelty-Free), hipoalergénicas y enriquecidas con extractos botánicos de la biodiversidad andina.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
