import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

export const AboutView: React.FC = () => {
  const navigate = useNavigate();
  const { aboutContent } = useConfig();

  return (
    <div className="py-16 bg-brand-cream min-h-[70vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
            {aboutContent.historyTag}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
            {aboutContent.historyTitle}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {aboutContent.historyDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-luxury p-8 rounded-3xl md:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {aboutContent.missionTag}
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                {aboutContent.missionTitle}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {aboutContent.missionDesc}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Líder" />
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Directora" />
                <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Consultora" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {aboutContent.consultantsCountText}
                </span>
                <span className="text-[11px] text-stone-500">
                  Capacitadas continuamente en dermocosmética
                </span>
              </div>
            </div>
          </div>

          <div className="card-luxury p-8 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-orange-600 uppercase block">{aboutContent.adviceTag}</span>
              <h4 className="font-editorial text-xl font-bold text-stone-900">{aboutContent.adviceTitle}</h4>
              <p className="text-stone-500 text-xs leading-relaxed">
                {aboutContent.adviceDesc}
              </p>
            </div>

            <button
              onClick={() => navigate('/unete')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-2 group cursor-pointer"
            >
              <span>Conoce el Plan de Carrera</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Línea de tiempo */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-orange-600">
              Nuestra trayectoria
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              Una red que crece contigo
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { year: '2018', title: 'Nace la red', text: 'Un grupo pequeño de consultoras decide acompañar a sus clientas con asesoría real, no solo con un catálogo.' },
              { year: '2021', title: 'Formación continua', text: 'Creamos rutinas de capacitación en dermocosmética, ventas y liderazgo para cada nueva integrante.' },
              { year: '2024', title: 'Liderazgo de zona', text: 'Las líderes acompañan equipos completos, revisan metas y comparten buenas prácticas cada campaña.' },
              { year: '2026', title: 'Comunidad digital', text: 'Digitalizamos catálogo, pedidos, abonos y facturas para que comprar y vender sea más claro y rápido.' },
            ].map((item) => (
              <div key={item.year} className="card-luxury rounded-3xl p-5 space-y-2">
                <span className="font-mono text-xs font-bold text-orange-600">{item.year}</span>
                <h3 className="font-editorial text-base font-bold text-stone-900">{item.title}</h3>
                <p className="text-[11px] leading-relaxed text-stone-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Diferenciadores */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: 'Asesoría personalizada', text: 'Cada clienta recibe una recomendación según su tipo de piel, rutina y presupuesto. Sin ventas a ciegas.' },
            { title: 'Productos 100 % originales', text: 'Trabajamos con catálogo y códigos oficiales Yanbal. Garantía de fábrica y trazabilidad por factura.' },
            { title: 'Acompañamiento real', text: 'La consultora y su líder están disponibles por WhatsApp para resolver dudas, cambios y seguimiento.' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">{item.title}</h3>
              <p className="text-xs leading-relaxed text-stone-600">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Cifras y CTA */}
        <section className="rounded-3xl bg-stone-900 p-8 text-white sm:p-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: '6+', label: 'Años acompañando clientas' },
              { value: '4', label: 'Líneas de belleza' },
              { value: '100%', label: 'Producto original Yanbal' },
              { value: '30 días', label: 'Para reembolsos verificados' },
            ].map((stat) => (
              <div key={stat.label}>
                <strong className="block font-editorial text-2xl text-amber-400">{stat.value}</strong>
                <span className="text-[11px] text-stone-300">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/catalogo')}
              className="rounded-full bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-700 cursor-pointer"
            >
              Ver catálogo de campaña
            </button>
            <button
              onClick={() => navigate('/unete')}
              className="rounded-full border border-white/30 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer"
            >
              Quiero unirme al equipo
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
