import React from 'react';
import { MessageCircle, Edit3, Trash2, CalendarCheck } from 'lucide-react';
import type { ConsultantClient } from '../../types';

interface ConsultantClientsTableProps {
  clients: ConsultantClient[];
  onEdit: (client: ConsultantClient) => void;
  onDelete: (client: ConsultantClient) => void;
  onMarkContactToday: (client: ConsultantClient) => void;
}

export const ConsultantClientsTable: React.FC<ConsultantClientsTableProps> = ({
  clients,
  onEdit,
  onDelete,
  onMarkContactToday,
}) => {
  if (clients.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-stone-400">
        No se encontraron clientas con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full text-xs text-left">
        <thead className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur text-stone-600 uppercase font-semibold text-[10px] border-b border-stone-200 shadow-2xs">
          <tr>
            <th className="py-3 px-4">Clienta</th>
            <th className="py-3 px-4">Contacto</th>
            <th className="py-3 px-4">Ubicación</th>
            <th className="py-3 px-4">Tipo de Piel</th>
            <th className="py-3 px-4">Preferencia</th>
            <th className="py-3 px-4">Último Contacto</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {clients.map((client) => {
            const cleanPhone = client.phone.replace(/[^0-9]/g, '');
            const wpMsg = encodeURIComponent(
              `Hola ${client.name}! Te escribo de Yanbal Prestige. Vi que tu categoría favorita es ${client.favoriteCategory} y tenemos novedades ideales para tu piel ${client.skinType.toLowerCase()}. ¿Te gustaría conocer las promociones de esta campaña?`
            );

            return (
              <tr key={client.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-semibold text-stone-900">{client.name}</p>
                  <span className="font-mono text-[11px] text-stone-400">{client.phone}</span>
                </td>
                <td className="py-3 px-4 text-stone-700">
                  <p>{client.email || 'Sin correo'}</p>
                  {client.documentId && (
                    <span className="text-[10px] text-stone-400">CC: {client.documentId}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-stone-700">
                  <p>{client.city || 'Bogotá D.C.'}</p>
                  {client.address && (
                    <span className="block text-[10px] text-stone-400 truncate max-w-[150px]">
                      {client.address}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    Piel {client.skinType}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                    {client.favoriteCategory}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span>{client.lastContactDate || 'Sin registro'}</span>
                    <button
                      type="button"
                      onClick={() => onMarkContactToday(client)}
                      title="Marcar contacto hoy"
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${wpMsg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                      title="Asesorar por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onEdit(client)}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                      title="Editar ficha"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(client)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      title="Eliminar clienta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
