import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { linesAccordionData } from '../../data/catalogData';

export const LineAccordion: React.FC = () => {
  const [activeLineId, setActiveLineId] = useState<string>(linesAccordionData[0].id);
  const navigate = useNavigate();

  const handleExplore = (category: string) => {
    navigate(`/catalogo?cat=${category}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 bg-brand-cream border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600">
            Líneas Emblemáticas Yanbal
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
            Innovación Botánica & Alta Gama
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Explora las líneas especializadas que combinan biotecnología antiedad, protección solar avanzada y perfumería fina.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[480px]">
          {linesAccordionData.map((line) => {
            const isActive = line.id === activeLineId;
            return (
              <div
                key={line.id}
                onClick={() => setActiveLineId(line.id)}
                className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out flex flex-col justify-end p-6 sm:p-8 ${
                  isActive
                    ? 'lg:flex-[3] min-h-[420px] shadow-2xl ring-2 ring-orange-500/50'
                    : 'lg:flex-[1] min-h-[140px] lg:min-h-0 bg-stone-900/80 hover:bg-stone-900/60'
                }`}
              >
                <img
                  src={line.image}
                  alt={line.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                    isActive ? 'scale-105 opacity-50' : 'opacity-30'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />

                <div className="relative z-10 text-white space-y-3">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-orange-400 block">
                    {line.tagline}
                  </span>
                  <h3 className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                    {line.title}
                  </h3>

                  {isActive && (
                    <div className="space-y-4 pt-1 animate-fadeIn">
                      <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed">
                        {line.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {line.claims.map((claim, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-medium text-stone-200 border border-white/10"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                            {claim}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExplore(line.categoryFilter);
                          }}
                          className="px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                        >
                          <span>Ver Productos de {line.title}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
