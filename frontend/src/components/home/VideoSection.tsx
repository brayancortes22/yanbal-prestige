import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';

export const VideoSection: React.FC = () => {
  const { videoTips } = useConfig();
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);
  const activeVideos = videoTips.filter((v) => v.active);
  const displayVideos = activeVideos.length > 0 ? activeVideos : videoTips;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Título */}
        <div className="text-center space-y-2">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-orange-600">
            Últimos Videos
          </h2>
          <p className="text-xs text-stone-500">
            Aprende a aplicar cada tratamiento con tutoriales paso a paso de nuestras asesoras expertas.
          </p>
        </div>

        {/* Grid de Tarjetas de Video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideoTitle(vid.title)}
              className="group card-luxury rounded-3xl overflow-hidden cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={vid.image}
                  alt={vid.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/30 group-hover:bg-stone-900/40 transition-colors" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>

                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-stone-950/80 text-white text-[10px] font-mono tracking-wider">
                  {vid.duration}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3 bg-white">
                <div className="space-y-1.5">
                  <h3 className="font-editorial text-base sm:text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {vid.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Simulado de Reproducción */}
        {activeVideoTitle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
              <div className="p-4 border-b border-stone-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-200">Reproduciendo: {activeVideoTitle}</span>
                <button
                  onClick={() => setActiveVideoTitle(null)}
                  className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-video bg-black flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-600/20 text-orange-500 flex items-center justify-center animate-pulse">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="text-xs text-stone-400 max-w-sm">
                  Video oficial Yanbal Prestige demostrativo. Consulta con tu consultora de zona para una sesión personalizada.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
