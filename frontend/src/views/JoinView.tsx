import React from 'react';
import { useConfig } from '../context/ConfigContext';
import { JoinFlipCards } from '../components/join/JoinFlipCards';

export const JoinView: React.FC = () => {
  const { joinContent } = useConfig();

  return (
    <div className="py-16 bg-white min-h-[75vh] animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
            {joinContent.tag || 'Carrera de Emprendimiento & Liderazgo'}
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl text-stone-900 font-bold leading-tight">
            {joinContent.title || 'Sé Parte de Nuestro Equipo'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {joinContent.subtitle || 'Elige la modalidad que mejor se adapte a tus metas: vende de forma libre con rentabilidad inmediata o construye una carrera corporativa liderando tu propio grupo de consultoras.'}
          </p>
        </div>

        {/* Módulo de Tarjetas 3D Flip Cards con Formulario al Reverso */}
        <JoinFlipCards />

      </div>
    </div>
  );
};
