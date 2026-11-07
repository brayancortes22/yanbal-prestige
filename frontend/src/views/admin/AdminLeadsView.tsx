import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { api, isApiConfigured } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';
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

export const AdminLeadsView: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [leads, setLeads] = useState<LeadProspect[]>([]);
  const [loading, setLoading] = useState(isApiConfigured());
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    api
      .getLeads()
      .then((data) => {
        if (!cancelled) setLeads(data || []);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudieron cargar los prospectos.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateUser = (lead: LeadProspect) => {
    navigate('/admin/usuarios', { state: { lead } });
    notify(`Datos de ${lead.fullName} cargados en el formulario de alta.`, 'info');
  };

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Reclutamiento & Crecimiento de Red
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Aspirantes Registradas en "Trabaja con nosotros"
            </h2>
            <p className="text-xs text-stone-500">
              Prospectos captados por el formulario público. Ábrelos para ver todos sus datos y
              convertirlos en integrantes de la red sin volver a escribirlos.
            </p>
          </div>
          <span className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            {loading ? 'Cargando…' : `${leads.length} aspirante${leads.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-xs text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando prospectos…
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              Aún no hay postulaciones. Cuando alguien envíe el formulario de “Trabaja con
              nosotros”, aparecerá aquí.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {leads.map((lead, index) => {
                const id = lead.id || `lead-${index}`;
                const expanded = expandedId === id;
                const phone = lead.phone.replace(/[^0-9]/g, '');
                return (
                  <div key={id} className="p-4">
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
                          onClick={() => setExpandedId(expanded ? null : id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-semibold text-stone-600 hover:bg-stone-100"
                        >
                          {expanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
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
                          onClick={() => handleCreateUser(lead)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-stone-800"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Crear integrante
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3 text-[11px] sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <span className="block font-bold uppercase text-stone-400">Teléfono</span>
                          <span className="text-stone-700">{lead.phone}</span>
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
                          <span className="block font-bold uppercase text-stone-400">
                            Experiencia / motivación
                          </span>
                          <span className="text-stone-700">
                            {lead.experience || 'Sin comentarios adicionales.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
