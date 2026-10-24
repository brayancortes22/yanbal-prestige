import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';

export const AboutView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16 bg-brand-cream min-h-[70vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
            Nuestra Historia & Propósito
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
            Quiénes Somos
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Somos una comunidad de líderes y consultoras de belleza que fusionamos la ciencia cosmética de Yanbal con un acompañamiento cercano para potenciar tu autoestima y bienestar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-luxury p-8 rounded-3xl md:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Misión de Equipo</span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                Transformamos vidas a través de la belleza responsable y el liderazgo financiero.
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Creemos que la cosmética va mucho más allá de un producto; es una herramienta de empoderamiento. Guiamos a mujeres en Colombia a construir negocios rentables sin sacrificar tiempo con su familia, respaldadas por una multinacional de 55 años de trayectoria.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Líder" />
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Directora" />
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Consultora" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">+45 Consultoras Activas</span>
                <span className="text-[11px] text-stone-500">Capacitadas continuamente en dermocosmética</span>
              </div>
            </div>
          </div>

          <div className="card-luxury p-8 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-xl font-bold text-stone-900">Asesoría Fisiológica</h4>
              <p className="text-stone-500 text-xs leading-relaxed">
                Cada tipo de piel tiene necesidades distintas. Evaluamos tu fototipo y condición cutánea antes de recomendarte cualquier tratamiento.
              </p>
            </div>

            <button
              onClick={() => navigate('/unete')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 text-left cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Conoce el Plan de Carrera</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
