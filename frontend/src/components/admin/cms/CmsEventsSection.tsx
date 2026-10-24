import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Check, X } from 'lucide-react';
import { useConfig } from '../../../context/ConfigContext';
import type { EventItem } from '../../../types';

export const CmsEventsSection: React.FC = () => {
  const { events, saveEvent, deleteEvent } = useConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('3:00 PM - 5:30 PM');
  const [modality, setModality] = useState<EventItem['modality']>('Presencial');
  const [location, setLocation] = useState('Sede Yanbal Norte / Salón de Belleza Prestige');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80');
  const [description, setDescription] = useState('');
  const [spots, setSpots] = useState('12 Cupos Disponibles');

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setDate('Sábado, 28 de Noviembre');
    setTime('3:00 PM - 5:00 PM');
    setModality('Presencial');
    setLocation('Sede Yanbal Norte / Salón de Belleza Prestige');
    setImage('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80');
    setDescription('Capacitación exclusiva para consultoras y clientas VIP.');
    setSpots('15 Cupos Disponibles');
    setIsEditing(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditId(ev.id);
    setTitle(ev.title);
    setDate(ev.date);
    setTime(ev.time);
    setModality(ev.modality);
    setLocation(ev.location);
    setImage(ev.image);
    setDescription(ev.description);
    setSpots(ev.spots);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    saveEvent({
      id: editId || `ev-${Date.now()}`,
      title,
      date,
      time,
      modality,
      location,
      image,
      description,
      spots,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-editorial text-lg font-bold text-stone-900">Agenda de Talleres & Eventos</h3>
          <p className="text-xs text-stone-500">Publica masterclasses presenciales o webinars virtuales de Zoom.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 className="font-editorial text-sm font-bold text-stone-900">
              {editId ? 'Editar Taller o Evento' : 'Publicar Nuevo Evento'}
            </h4>
            <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Título del evento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              required
              placeholder="Fecha (ej: Sábado, 14 de Noviembre)"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              placeholder="Horario (ej: 3:00 PM - 5:30 PM)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as any)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-semibold"
            >
              <option value="Presencial">Presencial</option>
              <option value="Virtual Vía Zoom">Virtual Vía Zoom</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ubicación o enlace"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
            <input
              type="text"
              placeholder="Cupos disponibles (ej: 12 Cupos Disponibles)"
              value={spots}
              onChange={(e) => setSpots(e.target.value)}
              className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <input
            type="url"
            required
            placeholder="URL de imagen del evento"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <textarea
            rows={2}
            placeholder="Descripción del evento..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Evento</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold">
                {ev.modality}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenEdit(ev)} className="p-1 text-stone-400 hover:text-orange-600 cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el evento "${ev.title}"?`)) deleteEvent(ev.id);
                  }}
                  className="p-1 text-stone-300 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-editorial text-sm font-bold text-stone-900">{ev.title}</h4>
              <p className="text-xs text-orange-600 font-semibold mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{ev.date} • {ev.time}</span>
              </p>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{ev.description}</p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="truncate max-w-[200px]">{ev.location}</span>
              <span className="text-emerald-700 font-bold shrink-0">{ev.spots}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
