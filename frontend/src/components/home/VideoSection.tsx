import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

export const VideoSection: React.FC = () => {
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);

  const videos = [
    {
      id: 'v1',
      title: 'Elixir de Vida: Rutina Anti-Edad',
      duration: '1:45 min',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
      description: 'Aprende los masajes linfáticos para maximizar la absorción de la crema rejuvenecedora.'
    },
    {
      id: 'v2',
      title: 'Extracto Divino: Cáliz de Uvilla',
      duration: '2:10 min',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      description: 'El secreto botánico andino para restaurar la densidad dérmica en pieles maduras.'
    },
    {
      id: 'v3',
      title: 'Aqua Fix: Hidratación Profunda',
      duration: '1:30 min',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      description: 'Fórmula en gel ultraligero con triple ácido hialurónico para piel fresca y luminosa.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Título (Inspirado en la captura de Yanbal) */}
        <div className="text-center space-y-2">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-orange-600">
            Últimos Videos
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Aprende a aplicar cada tratamiento con tutoriales paso a paso de nuestras asesoras expertas.
          </p>
        </div>

        {/* Grid de 3 Tarjetas de Video con Botón de Play Central */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((vid) => (
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

                {/* Botón Play Central (Idéntico a la captura) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white text-orange-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-stone-900/80 text-white text-[10px] font-mono">
                  {vid.duration}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-editorial text-base font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                  {vid.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {vid.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Simulación de Reproductor de Video */}
        {activeVideoTitle && (
          <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 relative border border-stone-800 shadow-2xl">
              <button
                onClick={() => setActiveVideoTitle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-editorial text-xl font-bold pr-10">{activeVideoTitle}</h3>
              <div className="aspect-video bg-stone-950 rounded-2xl flex items-center justify-center border border-stone-800">
                <div className="text-center space-y-2 p-6">
                  <Play className="w-12 h-12 text-orange-500 mx-auto animate-pulse" />
                  <p className="text-xs text-stone-400">
                    Reproduciendo tutorial de aplicación dermocosmética Yanbal Prestige.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
