import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Images } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { EventItem } from '../../../types';
import { EventForm } from './EventForm';

export const CmsEventsSection: React.FC = () => {
  const { events, saveEvent, deleteEvent } = useConfig();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const openCreate = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const openEdit = (event: EventItem) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSave = (event: EventItem) => {
    saveEvent(event);
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-editorial text-lg font-bold text-stone-900">
            Agenda de Talleres & Eventos
          </h3>
          <p className="text-xs text-stone-500">
            Publica masterclasses presenciales o webinars virtuales, con fotos y video.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {isFormOpen && (
        <EventForm
          event={editingEvent}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-stone-100">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold">
                    {event.modality}
                  </span>

                  <div className="flex items-center gap-1">
                    {event.media && event.media.length > 0 && (
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Images className="w-3 h-3" />
                        {event.media.length}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(event)}
                      title="Editar evento"
                      className="p-1 text-stone-400 hover:text-orange-600 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar el evento "${event.title}"?`)) deleteEvent(event.id);
                      }}
                      title="Eliminar evento"
                      className="p-1 text-stone-300 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-editorial text-sm font-bold text-stone-900 mt-1">
                  {event.title}
                </h4>
                <p className="text-xs text-orange-600 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {event.date} • {event.time}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-500 line-clamp-2">{event.description}</p>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="truncate max-w-[200px]">{event.location}</span>
              <span className="text-emerald-700 font-bold shrink-0">{event.spots}</span>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-stone-300 text-xs text-stone-400">
          No hay eventos publicados. Crea el primero con el botón «Nuevo Evento».
        </div>
      )}
    </div>
  );
};
