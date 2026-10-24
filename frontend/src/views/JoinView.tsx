import React from 'react';
import { JoinForm } from '../components/join/JoinForm';
import { TrendingUp, Gift, HeartHandshake } from 'lucide-react';

export const JoinView: React.FC = () => {
  return (
    <div className="py-16 bg-white min-h-[70vh] animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
            Carrera de Emprendimiento & Liderazgo
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
            Sé Parte de Nuestro Equipo
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Inicia tu propio negocio de belleza independiente con comisiones de hasta el 35%, entrenamientos constantes y acompañamiento de directoras experimentadas.
          </p>
        </div>

        {/* 3 Pilares de Beneficio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h4 className="font-editorial text-base font-bold text-stone-900">Ganancias del 25% al 35%</h4>
            <p className="text-xs text-stone-500">Rentabilidad directa sobre cada producto vendido, con bonos escalables por cumplimiento de metas.</p>
          </div>

          <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-2">
            <Gift className="w-6 h-6 text-orange-600" />
            <h4 className="font-editorial text-base font-bold text-stone-900">Kit de Inicio Bonificado</h4>
            <p className="text-xs text-stone-500">Recibe productos de alta rotación para demostración con tus primeros clientes a un precio simbólico.</p>
          </div>

          <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-2">
            <HeartHandshake className="w-6 h-6 text-orange-600" />
            <h4 className="font-editorial text-base font-bold text-stone-900">Mentoría y Cero Jefes</h4>
            <p className="text-xs text-stone-500">Maneja tu tiempo como prefieras. Te acompañamos en cada paso con clases de producto y ventas por redes.</p>
          </div>
        </div>

        {/* Sección Formulario Blindado */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="font-editorial text-2xl font-bold text-stone-900">
              Formulario de Inscripción
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Diligencia tus datos y una directora se comunicará contigo hoy mismo.
            </p>
          </div>
          <JoinForm />
        </div>

      </div>
    </div>
  );
};
