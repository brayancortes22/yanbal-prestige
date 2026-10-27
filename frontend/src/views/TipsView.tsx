import React, { useMemo, useState } from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import type { TipCategory } from '../types';
import { TipCard } from '../components/tips/TipCard';

const ALL = 'Todas' as const;
type Filter = typeof ALL | TipCategory;

export const TipsView: React.FC = () => {
  const { tips } = useConfig();
  const [filter, setFilter] = useState<Filter>(ALL);

  const activeTips = useMemo(
    () => tips.filter((tip) => tip.active).sort((a, b) => a.order - b.order),
    [tips]
  );

  const categories = useMemo<Filter[]>(() => {
    const present = Array.from(new Set(activeTips.map((tip) => tip.category)));
    return [ALL, ...present];
  }, [activeTips]);

  const visible = useMemo(
    () => (filter === ALL ? activeTips : activeTips.filter((tip) => tip.category === filter)),
    [activeTips, filter]
  );

  const featured = visible.find((tip) => tip.featured);
  const rest = visible.filter((tip) => tip.id !== featured?.id);

  return (
    <div className="py-14 bg-brand-cream min-h-[70vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-orange-600">
            <Sparkles className="w-3.5 h-3.5" /> Consejos de nuestras expertas
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
            Tips & Consejos de Belleza
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Rutinas, técnicas de maquillaje y consejos de negocio explicados paso a paso por
            nuestras Directoras y Consultoras. Sin promesas imposibles: solo lo que funciona en la
            vida real.
          </p>
        </header>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((category) => {
            const isActive = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400 text-xs">
            Todavía no hay consejos publicados en esta categoría. Vuelve pronto.
          </div>
        ) : (
          <div className="space-y-8">
            {featured && <TipCard tip={featured} variant="featured" />}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((tip) => (
                  <TipCard key={tip.id} tip={tip} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="card-luxury rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white">
          <div className="space-y-1.5">
            <h2 className="font-editorial text-xl font-bold text-stone-900">
              ¿Tienes una duda sobre tu piel?
            </h2>
            <p className="text-xs text-stone-500 max-w-md leading-relaxed">
              Escríbenos y te ayudamos a armar una rutina según tu tipo de piel, tu edad y tu
              presupuesto. La asesoría no tiene costo.
            </p>
          </div>
          <a
            href={`https://wa.me/573000000000?text=${encodeURIComponent(
              'Hola! Leí los tips de Yanbal Prestige y quiero una asesoría personalizada.'
            )}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Pedir asesoría</span>
          </a>
        </div>
      </div>
    </div>
  );
};
