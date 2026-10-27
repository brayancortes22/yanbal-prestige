import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { MediaGallery } from '../components/media/MediaGallery';

export const EventsView: React.FC = () => {
  const { events } = useConfig();

  return (
    <div className="py-16 bg-white min-h-[70vh] animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 block">
            Agenda de Capacitaciones & Lanzamientos
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-stone-900 font-normal">
            Talleres & Eventos del Equipo
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl leading-relaxed">
            Participa en nuestras masterclasses exclusivas de automaquillaje y conferencias virtuales de crecimiento empresarial.
          </p>
        </div>

        {/* Listado de Tarjetas de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((ev) => {
            const wpReserveLink = `https://wa.me/573000000000?text=${encodeURIComponent(
              `Hola! Deseo reservar mi cupo para el evento: "${ev.title}" programado para el ${ev.date}.`
            )}`;

            return (
              <div key={ev.id} className="card-luxury rounded-3xl overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto bg-stone-100 relative">
                  <MediaGallery
                    media={ev.media}
                    fallback={ev.image}
                    alt={ev.title}
                    variant="compact"
                  />
                  <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md pointer-events-none">
                    {ev.modality}
                  </span>
                </div>

                <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ev.time}</span>
                    </div>

                    <h3 className="font-editorial text-xl font-bold text-stone-900 leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-stone-500 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      {ev.spots}
                    </span>
                    <a
                      href={wpReserveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Reservar Cupo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="p-12 text-center bg-stone-50 rounded-3xl border border-stone-200 text-stone-400 text-xs">
            No hay talleres programados en este momento. Consulta con tu líder de zona.
          </div>
        )}

      </div>
    </div>
  );
};
