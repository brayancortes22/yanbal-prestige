import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Crown, ShieldCheck, Sparkles, UserX, KeyRound, UploadCloud } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { UserForm } from '../../components/admin/users/UserForm';
import { UserTable } from '../../components/admin/users/UserTable';
import { ResetRequestsPanel } from '../../components/admin/users/ResetRequestsPanel';
import { UserImportModal } from '../../components/admin/users/UserImportModal';
import { PaginationControls } from '../../components/common/PaginationControls';
import { useConfig } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { roleCounts, roleLabel } from '../../components/admin/users/roleConfig';
import type { AppUser, LeadProspect, UserRole } from '../../types';

const PAGE_SIZE = 15;

export const AdminUsersView: React.FC = () => {
  const {
    users,
    saveUser,
    toggleUserActive,
    deleteUser,
    resetRequests,
    approveResetRequest,
  } = useConfig();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [teamFilter, setTeamFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activas' | 'inactivas'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'directorio' | 'claves'>('directorio');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [prefill, setPrefill] = useState<Partial<AppUser> | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const handledLeadRef = useRef(false);
  const { notify } = useToast();
  const confirm = useConfirm();
  const { email: currentEmail } = useAuth();

  const leaders = useMemo(() => users.filter((user) => user.role === 'LIDER_ZONA'), [users]);
  const { activeDirectors } = roleCounts(users);

  const counts = useMemo(
    () => ({
      directoras: users.filter((user) => user.role === 'DIRECTORA').length,
      asistentes: users.filter((user) => user.role === 'ASISTENTE').length,
      lideres: users.filter((user) => user.role === 'LIDER_ZONA').length,
      consultoras: users.filter((user) => user.role === 'CONSULTORA').length,
      sinLider: users.filter((user) => user.role === 'CONSULTORA' && !user.leaderId).length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const leader = users.find((candidate) => candidate.id === user.leaderId);
      const matchSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.documentId.includes(term) ||
        user.zone.toLowerCase().includes(term) ||
        (leader?.name.toLowerCase().includes(term) ?? false);
      const matchRole = roleFilter === 'todos' || user.role === roleFilter;
      const matchTeam =
        teamFilter === 'todos' ||
        (teamFilter === 'sin-lider' && user.role === 'CONSULTORA' && !user.leaderId) ||
        user.leaderId === teamFilter ||
        user.id === teamFilter;
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activas' && user.active) ||
        (statusFilter === 'inactivas' && !user.active);
      return matchSearch && matchRole && matchTeam && matchStatus;
    });
  }, [users, searchTerm, roleFilter, teamFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handleSave = (user: AppUser) => {
    const isNew = !editingUser;
    saveUser(user);
    setIsEditing(false);
    setEditingUser(null);
    notify(
      isNew
        ? `${user.name} se registró en la red${user.leaderId ? ' con líder asignado' : ' sin líder asignado'}.`
        : `Los datos de ${user.name} se actualizaron.`
    );
  };

  const handleImportUsers = (newUsers: AppUser[]) => {
    newUsers.forEach((u) => saveUser(u));
    notify(`Se importaron ${newUsers.length} usuarias exitosamente a la red.`);
  };

  const openCreate = () => {
    setEditingUser(null);
    setPrefill(null);
    setIsEditing(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const openEdit = (user: AppUser) => {
    setEditingUser(user);
    setPrefill(null);
    setIsEditing(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleChangeRole = (user: AppUser, newRole: UserRole) => {
    if (user.role === newRole) return;
    if (user.role === 'DIRECTORA' && activeDirectors <= 1 && newRole !== 'DIRECTORA') {
      notify('No puedes remover la única administradora activa de la red.', 'error');
      return;
    }
    const updated: AppUser = {
      ...user,
      role: newRole,
      leaderId: newRole === 'DIRECTORA' || newRole === 'SUPER_ADMIN' ? undefined : user.leaderId,
    };
    saveUser(updated);
    notify(`Rol de ${user.name} actualizado a ${roleLabel(newRole)}.`);
  };

  const handleToggle = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user?.role === 'DIRECTORA' && user.active && activeDirectors <= 1) {
      notify('No puedes desactivar la única administradora activa de la red.', 'error');
      return;
    }
    toggleUserActive(id);
    if (user) {
      notify(`Integrante ${user.name} ${user.active ? 'desactivado/a' : 'activado/a'}.`);
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (user.role === 'DIRECTORA') {
      notify('Por seguridad no se puede eliminar a una Administradora.', 'error');
      return;
    }
    const ok = await confirm({
      title: '¿Eliminar integrante de la red?',
      message: `Esta acción removerá a ${user.name} (${user.email}) y no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      tone: 'danger',
    });
    if (!ok) return;
    deleteUser(user.id);
    notify(`Integrante ${user.name} eliminado/a.`);
  };

  const handleCopyPin = (id: string, pin: string) => {
    void navigator.clipboard.writeText(pin);
    setCopiedId(id);
    notify('PIN temporal copiado al portapapeles.');
    setTimeout(() => setCopiedId(null), 3000);
  };

  useEffect(() => {
    const state = location.state as { fromLead?: LeadProspect } | null;
    if (state?.fromLead && !handledLeadRef.current) {
      handledLeadRef.current = true;
      const lead = state.fromLead;
      const suggestedRole: UserRole =
        lead.roleInterest === 'directora'
          ? 'LIDER_ZONA'
          : lead.roleInterest === 'cliente'
            ? 'CONSULTORA'
            : 'CONSULTORA';

      setPrefill({
        name: lead.fullName,
        email: lead.email || '',
        phone: lead.phone,
        zone: [lead.city, lead.department].filter(Boolean).join(' - ') || 'Zona 12 - Bogotá Norte',
        role: suggestedRole,
      });
      setIsEditing(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <div className="min-h-[85vh] animate-fadeIn bg-brand-cream py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <AdminNav />

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Equipo de Trabajo & Roles
            </h2>
            <p className="max-w-2xl text-xs text-stone-500">
              Supervisión del equipo, asignación de líderes y control de accesos centralizado.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="btn-import-users-csv"
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors"
            >
              <UploadCloud className="h-4 w-4 text-orange-600" />
              <span>Importar Excel / CSV</span>
            </button>
            <button
              id="btn-new-user"
              type="button"
              onClick={openCreate}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-apricot px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-apricot-dark"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo integrante</span>
            </button>
          </div>
        </div>

        {/* Resumen numérico */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: 'Administradoras', value: counts.directoras, Icon: Crown, tone: 'text-brand-apricot-dark bg-brand-apricot-soft' },
            { label: 'Asistentes', value: counts.asistentes, Icon: ShieldCheck, tone: 'text-sky-700 bg-sky-50' },
            { label: 'Líderes de zona', value: counts.lideres, Icon: ShieldCheck, tone: 'text-[#8A6D12] bg-[#FBF3D9]' },
            { label: 'Consultoras', value: counts.consultoras, Icon: Sparkles, tone: 'text-emerald-700 bg-emerald-50' },
            { label: 'Sin líder', value: counts.sinLider, Icon: UserX, tone: 'text-stone-600 bg-stone-100' },
          ].map(({ label, value, Icon, tone }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <strong className="block font-editorial text-xl text-stone-900">{value}</strong>
                <span className="text-[10px] text-stone-500">{label}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Sub-Pestañas Internas */}
        <div className="flex items-center gap-2 border-b border-stone-200/80 pb-2">
          <button
            id="tab-directorio"
            type="button"
            onClick={() => setActiveSection('directorio')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'directorio'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directorio de la Red ({users.length})</span>
          </button>
          <button
            id="tab-claves"
            type="button"
            onClick={() => setActiveSection('claves')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'claves'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Solicitudes de Clave</span>
            {resetRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-600 text-white font-bold animate-pulse">
                {resetRequests.length}
              </span>
            )}
          </button>
        </div>

        {isEditing && (
          <div ref={formRef} className="scroll-mt-24">
            <UserForm
              key={`${editingUser?.id ?? 'new'}-${prefill?.email ?? ''}`}
              editingUser={editingUser}
              prefill={prefill}
              users={users}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setEditingUser(null);
                setPrefill(null);
              }}
            />
          </div>
        )}

        {/* Vista Sección: Solicitudes de Clave */}
        {activeSection === 'claves' && (
          <ResetRequestsPanel
            requests={resetRequests}
            users={users}
            copiedId={copiedId}
            onApprove={approveResetRequest}
            onCopyPin={handleCopyPin}
          />
        )}

        {/* Vista Sección: Directorio de la Red */}
        {activeSection === 'directorio' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs md:flex-row">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar nombre, correo, cédula, zona o líder..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-10 pr-4 text-xs"
                />
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs font-medium text-stone-700"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="DIRECTORA">Administradora</option>
                  <option value="ASISTENTE">Asistente administrativa</option>
                  <option value="LIDER_ZONA">Líder de zona</option>
                  <option value="CONSULTORA">Consultora</option>
                  <option value="SUPER_ADMIN">Desarrollador (soporte)</option>
                </select>

                <select
                  value={teamFilter}
                  onChange={(event) => {
                    setTeamFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs font-medium text-stone-700"
                >
                  <option value="todos">Todos los equipos</option>
                  <option value="sin-lider">Sin líder asignado</option>
                  {leaders.map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      Equipo de {leader.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as 'todos' | 'activas' | 'inactivas');
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs font-medium text-stone-700"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activas">Solo activas</option>
                  <option value="inactivas">Solo inactivas</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
              <div className="flex flex-col gap-1 border-b border-stone-100 p-4 font-editorial text-base font-bold text-stone-900 sm:flex-row sm:items-center sm:justify-between">
                <span>Directorio de la red</span>
                <span className="font-sans text-xs font-normal text-stone-500">
                  <Users className="mr-1 inline h-3.5 w-3.5" />
                  {filteredUsers.length} integrantes · toca el rol para cambiarlo
                </span>
              </div>
              <UserTable
                users={paginatedUsers}
                allUsers={users}
                currentEmail={currentEmail}
                canManageRoles
                onChangeRole={handleChangeRole}
                onEdit={openEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredUsers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemName="integrantes"
            />
          </div>
        )}

        <UserImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImportUsers}
        />
      </div>
    </div>
  );
};
