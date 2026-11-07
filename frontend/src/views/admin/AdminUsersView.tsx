import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Crown, ShieldCheck, Sparkles, UserX } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { UserForm } from '../../components/admin/users/UserForm';
import { UserTable } from '../../components/admin/users/UserTable';
import { ResetRequestsPanel } from '../../components/admin/users/ResetRequestsPanel';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../components/ui/ToastProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import type { AppUser, LeadProspect } from '../../types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [prefill, setPrefill] = useState<Partial<AppUser> | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const handledLeadRef = useRef(false);
  const { notify } = useToast();
  const confirm = useConfirm();

  const leaders = useMemo(() => users.filter((user) => user.role === 'LIDER_ZONA'), [users]);

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

  const handleToggle = async (id: string) => {
    const user = users.find((candidate) => candidate.id === id);
    const accepted = await confirm({
      title: user?.active ? '¿Desactivar esta cuenta?' : '¿Reactivar esta cuenta?',
      message: user?.active
        ? `${user.name} no podrá iniciar sesión hasta que la reactives. Sus ventas e historial se conservan.`
        : `${user?.name || 'La integrante'} podrá volver a iniciar sesión y operar en la red.`,
      confirmText: user?.active ? 'Sí, desactivar' : 'Sí, reactivar',
      tone: user?.active ? 'danger' : 'primary',
    });
    if (!accepted) return;

    toggleUserActive(id);
    notify(
      user?.active
        ? `${user.name} quedó inactiva y no podrá iniciar sesión.`
        : `${user?.name || 'La integrante'} quedó activa de nuevo.`,
      'info'
    );
  };

  const handleDelete = async (user: AppUser) => {
    const accepted = await confirm({
      title: '¿Dar de baja a esta integrante?',
      message: `${user.name} se eliminará del directorio. Sus ventas históricas se conservan, pero no podrá volver a ingresar.`,
      confirmText: 'Sí, dar de baja',
      tone: 'danger',
    });
    if (!accepted) return;
    deleteUser(user.id);
    notify(`${user.name} fue eliminada del directorio.`, 'info');
  };

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const scrollToForm = () => {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const openCreate = () => {
    setEditingUser(null);
    setPrefill(null);
    setIsEditing(true);
    scrollToForm();
  };

  const openEdit = (user: AppUser) => {
    setEditingUser(user);
    setPrefill(null);
    setIsEditing(true);
    scrollToForm();
  };

  // Alta rápida desde un prospecto de “Trabaja con nosotros”.
  useEffect(() => {
    const lead = (location.state as { lead?: LeadProspect } | null)?.lead;
    if (!lead || handledLeadRef.current) return;

    handledLeadRef.current = true;
    setEditingUser(null);
    setPrefill({
      name: lead.fullName,
      email: lead.email || '',
      phone: lead.phone,
      zone: [lead.city, lead.department].filter(Boolean).join(' - '),
      role: lead.roleInterest === 'directora' ? 'LIDER_ZONA' : 'CONSULTORA',
    });
    setIsEditing(true);
    scrollToForm();
    navigate(location.pathname, { replace: true });
  }, [location, navigate]);

  return (
    <div className="min-h-[85vh] animate-fadeIn bg-brand-cream">
      <AdminNav />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xs md:flex-row md:items-center">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-brand-apricot">
              Control de accesos & jerarquía de la red
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Equipo, roles y equipos de líderes
            </h2>
            <p className="max-w-2xl text-xs text-stone-500">
              Define quién administra, quién lidera un equipo y qué consultoras reportan a cada
              líder. Una consultora sin líder queda marcada para asignación.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-1.5 self-start rounded-xl bg-brand-apricot px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-apricot-dark md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva integrante</span>
          </button>
        </div>

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

        <ResetRequestsPanel
          requests={resetRequests}
          users={users}
          copiedId={copiedId}
          onApprove={approveResetRequest}
          onCopyPin={handleCopyPin}
        />

        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs md:flex-row">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar nombre, correo, cédula, zona o líder..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-10 pr-4 text-xs"
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs font-medium text-stone-700"
            >
              <option value="todos">Todos los roles</option>
              <option value="DIRECTORA">Administradora</option>
              <option value="ASISTENTE">Asistente administrativa</option>
              <option value="LIDER_ZONA">Líder de zona</option>
              <option value="CONSULTORA">Consultora</option>
            </select>

            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
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
              onChange={(event) =>
                setStatusFilter(event.target.value as 'todos' | 'activas' | 'inactivas')
              }
              className="rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs font-medium text-stone-700"
            >
              <option value="todos">Todos los estados</option>
              <option value="activas">Solo activas</option>
              <option value="inactivas">Solo inactivas</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 p-4 font-editorial text-base font-bold text-stone-900">
            <span>Directorio de la red</span>
            <span className="font-sans text-xs font-normal text-stone-500">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              {filteredUsers.length} integrantes
            </span>
          </div>
          <UserTable
            users={filteredUsers}
            allUsers={users}
            onEdit={openEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};
