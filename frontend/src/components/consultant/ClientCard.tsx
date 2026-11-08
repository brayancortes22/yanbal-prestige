import React from 'react';
import { MessageCircle, Trash2, Edit3, CalendarCheck } from 'lucide-react';
import type { ConsultantClient } from '../../types';

interface ClientCardProps {
  client: ConsultantClient;
  onEdit: (client: ConsultantClient) => void;
  onDelete: (client: ConsultantClient) => void;
  onMarkContactToday: (client: ConsultantClient) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onEdit,
  onDelete,
  onMarkContactToday,
}) => {
  const wpMsg = encodeURIComponent(
    `Hola ${client.name}! Te escribo de Yanbal Prestige. Vi que tu categoría favorita es ${client.favoriteCategory} y tenemos novedades ideales para tu piel ${client.skinType.toLowerCase()}. ¿Te gustaría conocer las promociones de esta campaña?`
  );
  const cleanPhone = client.phone.replace(/[^0-9]/g, '');

  return (
    <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-editorial text-base font-bold text-stone-900">{client.name}</h4>
          <span className="text-xs text-stone-400 font-mono">{client.phone}</span>
          {client.email && (
            <span className="block text-[11px] text-stone-500">{client.email}</span>
          )}
          {(client.city || client.neighborhood) && (
            <span className="block text-[11px] text-stone-500">
              {[client.city, client.neighborhood, client.address, client.postalCode]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(client)}
            className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
            title="Editar ficha"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(client)}
            className="p-1.5 text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
            title="Eliminar ficha"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px]">
        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
          Piel {client.skinType}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
          {client.favoriteCategory}
        </span>
      </div>

      {client.notes && (
        <p className="text-xs text-stone-600 bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
          {client.notes}
        </p>
      )}

      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
        <div className="flex items-center gap-1.5">
          <span>Último contacto: {client.lastContactDate}</span>
          <button
            onClick={() => onMarkContactToday(client)}
            title="Marcar contacto hoy"
            className="text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
          </button>
        </div>

        <a
          href={`https://wa.me/${cleanPhone}?text=${wpMsg}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Asesorar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
