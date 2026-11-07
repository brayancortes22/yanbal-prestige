import React, { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import type { EventItem, MediaItem } from '../../../types';
import { MediaUploader } from '../../media/MediaUploader';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80';

interface Props {
  event: EventItem | null;
  onSave: (event: EventItem) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<Props> = ({ event, onSave, onCancel }) => {
  const [title, setTitle] = useState(event?.title ?? '');
  const [startDate, setStartDate] = useState(
    event?.startAt?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(
    event?.startAt ? event.startAt.slice(11, 16) : '15:00'
  );
  const [endTime, setEndTime] = useState(
    event?.endAt ? event.endAt.slice(11, 16) : '17:30'
  );
  const [modality, setModality] = useState<EventItem['modality']>(
    event?.modality ?? 'Presencial'
  );
  const [location, setLocation] = useState(
    event?.location ?? 'Sede Yanbal Norte / Salón de Belleza Prestige'
  );
  const [description, setDescription] = useState(event?.description ?? '');
  const [spots, setSpots] = useState(event?.spots ?? '12 Cupos Disponibles');
  const [media, setMedia] = useState<MediaItem[]>(
    event?.media && event.media.length > 0
      ? event.media
      : event?.image
        ? [{ id: 'cover', url: event.image, type: 'image', alt: event.title }]
        : []
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();

    if (!title.trim() || !startDate || !startTime || !endTime) {
      setError('El título, la fecha y el horario son obligatorios.');
      return;
    }

    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${startDate}T${endTime}:00`);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError('La fecha u hora no es válida.');
      return;
    }
    if (end <= start) {
      setError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }
    if (start < todayStart) {
      setError('No se puede publicar un evento en una fecha anterior al día de hoy.');
      return;
    }

    const dateLabel = new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(start);
    const timeLabel = `${start.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}`;

    const cover =
      media.find((item) => item.type === 'image')?.url || event?.image || FALLBACK_IMAGE;

    onSave({
      id: event?.id ?? `ev-${Date.now()}`,
      title: title.trim(),
      date: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
      time: timeLabel,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      modality,
      location: location.trim(),
      image: cover,
      media,
      description: description.trim(),
      spots: spots.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <h4 className="font-editorial text-sm font-bold text-stone-900">
          {event ? 'Editar Taller o Evento' : 'Publicar Nuevo Evento'}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          placeholder="Título del evento"
          value={title}
          onChange={(changeEvent) => setTitle(changeEvent.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="date"
          required
          min={new Date().toISOString().slice(0, 10)}
          value={startDate}
          onChange={(changeEvent) => setStartDate(changeEvent.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
          aria-label="Fecha del evento"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] font-semibold text-stone-500">
            Inicio
            <input
              type="time"
              required
              value={startTime}
              onChange={(changeEvent) => setStartTime(changeEvent.target.value)}
              className="mt-0.5 w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </label>
          <label className="text-[10px] font-semibold text-stone-500">
            Fin
            <input
              type="time"
              required
              value={endTime}
              onChange={(changeEvent) => setEndTime(changeEvent.target.value)}
              className="mt-0.5 w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </label>
        </div>
        <select
          value={modality}
          onChange={(changeEvent) =>
            setModality(changeEvent.target.value as EventItem['modality'])
          }
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
          onChange={(changeEvent) => setLocation(changeEvent.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
        <input
          type="text"
          placeholder="Cupos disponibles (ej: 12 Cupos Disponibles)"
          value={spots}
          onChange={(changeEvent) => setSpots(changeEvent.target.value)}
          className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
        />
      </div>

      <textarea
        rows={2}
        placeholder="Descripción del evento..."
        value={description}
        onChange={(changeEvent) => setDescription(changeEvent.target.value)}
        className="w-full p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
      />

      <div className="p-3 rounded-2xl border border-stone-200 bg-stone-50/40">
        <MediaUploader
          media={media}
          onChange={setMedia}
          maxFiles={8}
          subFolder="events"
          label="Fotos y videos del evento"
          hint="Sube varias fotos del taller anterior y un video corto de invitación."
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
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
  );
};
