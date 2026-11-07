import React, { useState } from 'react';
import { UserCheck, X, ShieldCheck, Crown, Sparkles } from 'lucide-react';
import type { AppUser, UserRole } from '../../../types';
import { SearchableSelect } from '../../common/SearchableSelect';

interface UserFormProps {
  editingUser: AppUser | null;
  prefill?: Partial<AppUser> | null;
  users: AppUser[];
  onSave: (user: AppUser) => void;
  onCancel: () => void;
}

const roleHelp: Record<string, { label: string; description: string; Icon: typeof Crown }> = {
  DIRECTORA: {
    label: 'Administradora / Directora',
    description: 'Control total: red, catálogo, CMS, prospectos y usuarios.',
    Icon: Crown,
  },
  ASISTENTE: {
    label: 'Asistente administrativa',
    description:
      'Apoya a la administradora con catálogo, CMS, anuncios, prospectos y ventas. No gestiona usuarios ni roles.',
    Icon: ShieldCheck,
  },
  LIDER_ZONA: {
    label: 'Líder de zona',
    description:
      'Vende igual que una consultora y, además, tiene trabajadoras a cargo: ve su equipo y sus ventas.',
    Icon: ShieldCheck,
  },
  CONSULTORA: {
    label: 'Consultora / Vendedora',
    description: 'Vende, registra pedidos y administra su cartera de clientas.',
    Icon: Sparkles,
  },
};

/**
 * Formulario de alta/edición de integrantes de la red. Incluye la
 * asignación de líder, que antes no existía: la administradora podía crear
 * una consultora pero no sabía a qué equipo pertenecía.
 */
export const UserForm: React.FC<UserFormProps> = ({
  editingUser,
  prefill,
  users,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(editingUser?.name ?? prefill?.name ?? '');
  const [email, setEmail] = useState(editingUser?.email ?? prefill?.email ?? '');
  const [role, setRole] = useState<UserRole>(
    editingUser?.role ?? prefill?.role ?? 'CONSULTORA'
  );
  const [documentId, setDocumentId] = useState(editingUser?.documentId ?? '');
  const [phone, setPhone] = useState(editingUser?.phone ?? prefill?.phone ?? '');
  const [zone, setZone] = useState(
    editingUser?.zone ?? prefill?.zone ?? 'Zona 12 - Bogotá'
  );
  const [leaderId, setLeaderId] = useState(editingUser?.leaderId ?? '');
  const [error, setError] = useState('');

  const leaders = users.filter(
    (user) => user.role === 'LIDER_ZONA' && user.active && user.id !== editingUser?.id
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !documentId.trim()) {
      setError('Nombre, correo y cédula son obligatorios.');
      return;
    }
    const duplicatedEmail = users.some(
      (user) =>
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.id !== editingUser?.id
    );
    if (duplicatedEmail) {
      setError('Ya existe una integrante con ese correo electrónico.');
      return;
    }

    const target: AppUser = {
      id: editingUser?.id ?? `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      documentId: documentId.trim(),
      phone: phone.trim(),
      zone: zone.trim(),
      active: editingUser ? editingUser.active : true,
      leaderId: role === 'CONSULTORA' ? leaderId || undefined : undefined,
    };

    onSave(target);
  };

  const help = roleHelp[role] ?? roleHelp.CONSULTORA;
  const HelpIcon = help.Icon;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-brand-apricot/30 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <h3 className="font-editorial text-base font-bold text-stone-900">
          {editingUser ? 'Editar integrante de la red' : 'Registrar nueva integrante'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer text-stone-400 hover:text-stone-700"
          aria-label="Cerrar formulario"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {prefill && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-[11px] text-sky-800">
          <strong>Datos precargados desde Prospectos.</strong> Nombre, correo, WhatsApp y zona ya
          vienen del formulario público. Completa la cédula y confirma el rol para crear la cuenta.
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-[11px] font-semibold text-stone-600">
          Nombre completo *
          <input
            type="text"
            required
            maxLength={150}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-normal"
          />
        </label>
        <label className="text-[11px] font-semibold text-stone-600">
          Correo electrónico *
          <input
            type="email"
            required
            maxLength={150}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-normal"
          />
        </label>
        <label className="text-[11px] font-semibold text-stone-600">
          Cédula de ciudadanía *
          <input
            type="text"
            required
            inputMode="numeric"
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 font-mono text-xs font-normal"
          />
        </label>
        <label className="text-[11px] font-semibold text-stone-600">
          WhatsApp
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+57 315 222 3344"
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-normal"
          />
        </label>
        <label className="text-[11px] font-semibold text-stone-600">
          Zona / municipio
          <input
            type="text"
            value={zone}
            onChange={(event) => setZone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-normal"
          />
        </label>
        <label className="text-[11px] font-semibold text-stone-600">
          Rol en la red
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-semibold"
          >
            <option value="CONSULTORA">Consultora / Vendedora</option>
            <option value="LIDER_ZONA">Líder de zona</option>
            <option value="ASISTENTE">Asistente administrativa</option>
            <option value="DIRECTORA">Administradora / Directora</option>
          </select>
        </label>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-stone-50 p-3">
        <HelpIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-apricot" />
        <p className="text-[11px] leading-relaxed text-stone-600">
          <strong className="text-stone-800">{help.label}:</strong> {help.description}
        </p>
      </div>

      {role === 'CONSULTORA' && (
        <div className="block text-[11px] font-semibold text-stone-600">
          Líder a cargo (equipo)
          <div className="mt-1">
            <SearchableSelect
              options={leaders.map((leader) => ({
                value: leader.id,
                label: leader.name,
                hint: leader.zone,
                keywords: leader.email,
              }))}
              value={leaderId}
              onChange={setLeaderId}
              placeholder="Sin líder asignado — buscar por nombre o zona"
              emptyMessage="No hay líderes que coincidan con la búsqueda."
              clearable
            />
          </div>
          <span className="mt-1 block text-[10px] font-normal text-stone-400">
            El líder podrá ver esta consultora y sus ventas en su panel de equipo.
          </span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-espresso px-5 py-2 text-xs font-semibold text-white shadow-sm"
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>{editingUser ? 'Guardar cambios' : 'Registrar en la red'}</span>
        </button>
      </div>
    </form>
  );
};
