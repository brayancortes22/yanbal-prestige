import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, Filter } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { AdminLeadsTable } from '../../components/admin/leads/AdminLeadsTable';
import { PaginationControls } from '../../components/common/PaginationControls';
import { api, isApiConfigured } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';
import type { LeadProspect } from '../../types';

const PAGE_SIZE = 15;

export const AdminLeadsView: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [leads, setLeads] = useState<LeadProspect[]>([]);
  const [loading, setLoading] = useState(isApiConfigured());
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        !searchTerm ||
        l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm) ||
        (l.city && l.city.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'ALL' || l.roleInterest === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [leads, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLeads.slice(start, start + PAGE_SIZE);
  }, [filteredLeads, currentPage]);

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
              Prospectos captados por el formulario público. Supervisa en tabla institucional, contacta por WhatsApp y da de alta en la red.
            </p>
          </div>
          <span className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 self-start sm:self-auto">
            {loading ? 'Cargando…' : `${leads.length} aspirantes`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white/70 p-3 rounded-2xl border border-stone-200/70 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o ciudad..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-stone-400 hidden sm:inline" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">Todos los intereses</option>
              <option value="consultora">Consultora</option>
              <option value="directora">Líder / Directora</option>
              <option value="cliente">Clienta</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <p className="font-bold">
                {error.includes('401') ? 'Tu sesión ha caducado o requiere reautenticación.' : error}
              </p>
              {error.includes('401') && (
                <p className="text-[11px] text-rose-600 mt-0.5">
                  Por seguridad, la sesión administrativa expira tras inactividad. Inicia sesión nuevamente para ver y procesar los prospectos.
                </p>
              )}
            </div>
            {error.includes('401') && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-xs text-stone-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando prospectos…
            </div>
          ) : (
            <AdminLeadsTable
              leads={paginatedLeads}
              expandedId={expandedId}
              onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              onCreateUser={handleCreateUser}
            />
          )}
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeads.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemName="aspirantes"
        />
      </div>
    </div>
  );
};
