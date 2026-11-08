import React from 'react';
import {
  MessageCircle,
  ShieldCheck,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LeadProspect } from '../../../types';

const ROLE_LABELS: Record<string, string> = {
  consultora: 'Consultora',
  directora: 'Líder / Directora',
  cliente: 'Clienta',
};

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

interface AdminLeadsTableProps {
  leads: LeadProspect[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onCreateUser: (lead: LeadProspect) => void;
}

export const AdminLeadsTable: React.FC<AdminLeadsTableProps> = ({
  leads,
  expandedId,
  onToggleExpand,
  onCreateUser,
}) => {
  if (leads.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-stone-400">
        No se encontraron aspirantes con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full text-xs text-left">
        <thead className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur text-stone-600 uppercase font-semibold text-[10px] border-b border-stone-200 shadow-2xs">
          <tr>
            <th className="py-3 px-4">Aspirante</th>
            <th className="py-3 px-4">Contacto</th>
            <th className="py-3 px-4">Ubicación</th>
            <th className="py-3 px-4">Interés</th>
            <th className="py-3 px-4">Postulación</th>
            <th className="py-3 px-4">Habeas Data</th>
            <th className="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {leads.map((lead, index) => {
            const id = lead.id || `lead-${index}`;
            const expanded = expandedId === id;
            const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
            const wpMsg = encodeURIComponent(
              `Hola ${lead.fullName}, te escribe la Directora Yuli de Yanbal Prestige. Vi tu postulación para ${
                ROLE_LABELS[lead.roleInterest] || lead.roleInterest
              } y quiero contarte el plan de carrera.`
            );

            return (
              <React.Fragment key={id}>
                <tr className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-stone-900">{lead.fullName}</p>
                    <span className="font-mono text-[11px] text-stone-400">{lead.phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-stone-700">{lead.email || 'Sin correo'}</p>
                  </td>
                  <td className="py-3 px-4 text-stone-700">
                    <p>{lead.city || 'No indicada'}</p>
                    {lead.department && (
                      <span className="text-[10px] text-stone-400">{lead.department}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200/80">
                      {ROLE_LABELS[lead.roleInterest] || lead.roleInterest}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                      <ShieldCheck className="h-3 w-3" /> Aceptado
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleExpand(id)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title={expanded ? 'Ocultar detalles' : 'Ver ficha completa'}
                      >
                        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${wpMsg}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onCreateUser(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 text-white font-medium text-[11px] hover:bg-stone-800 transition cursor-pointer"
                        title="Crear integrante en el directorio"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Crear</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {expanded && (
                  <tr className="bg-orange-50/30">
                    <td colSpan={7} className="p-4 border-b border-orange-100">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                        <div>
                          <strong className="block text-stone-500 uppercase text-[10px]">Dirección</strong>
                          <span className="text-stone-800">{lead.address || 'No indicada'}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <strong className="block text-stone-500 uppercase text-[10px]">Experiencia / Motivación</strong>
                          <span className="text-stone-800">{lead.experience || 'Sin comentarios adicionales.'}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
