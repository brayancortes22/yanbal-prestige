import React from 'react';
import {
  MessageCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp,
  UserPlus,
} from 'lucide-react';
import type { LeadProspect } from '../../types';

const ROLE_LABELS: Record<string, string> = {
  consultora: 'Consultora de Belleza',
  directora: 'Líder / Directora',
  cliente: 'Clienta con asesoría',
};

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

interface LeadCardProps {
  lead: LeadProspect;
  expanded: boolean;
  onToggleExpand: () => void;
  onCreateUser: (lead: LeadProspect) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  expanded,
  onToggleExpand,
  onCreateUser,
}) => {
  const phone = lead.phone.replace(/[^0-9]/g, '');

  return (
    <div className="p-4 hover:bg-stone-50/50 transition">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-sm text-stone-900">{lead.fullName}</strong>
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
              {ROLE_LABELS[lead.roleInterest] || lead.roleInterest}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <ShieldCheck className="mr-1 inline h-3 w-3" /> Habeas Data
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {lead.city}
              {lead.department ? `, ${lead.department}` : ''}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(lead.createdAt)}
            </span>
            {lead.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {lead.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-semibold text-stone-600 hover:bg-stone-100"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Ocultar datos' : 'Ver más datos'}
          </button>
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(
              `Hola ${lead.fullName}, te escribe la Directora Yuli de Yanbal Prestige. Vi tu postulación y quiero contarte el plan de carrera.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          <button
            type="button"
            onClick={() => onCreateUser(lead)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-stone-800"
          >
            <UserPlus className="h-3.5 w-3.5" /> Crear integrante
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 text-[11px] sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
          <div>
            <span className="block font-bold uppercase text-stone-400">Teléfono</span>
            <span className="text-stone-700 font-mono">{lead.phone}</span>
          </div>
          <div>
            <span className="block font-bold uppercase text-stone-400">Correo</span>
            <span className="text-stone-700">{lead.email || 'No indicado'}</span>
          </div>
          <div>
            <span className="block font-bold uppercase text-stone-400">Ciudad</span>
            <span className="text-stone-700">
              {lead.city}
              {lead.department ? ` · ${lead.department}` : ''}
            </span>
          </div>
          <div>
            <span className="block font-bold uppercase text-stone-400">Dirección</span>
            <span className="text-stone-700">{lead.address || 'No indicada'}</span>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <span className="block font-bold uppercase text-stone-400">Experiencia / motivación</span>
            <span className="text-stone-700">{lead.experience || 'Sin comentarios adicionales.'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
