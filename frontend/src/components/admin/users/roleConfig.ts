import { Crown, ShieldCheck, Sparkles, Terminal, Users } from 'lucide-react';
import type { AppUser, UserRole } from '../../../types';

type RoleVisual = {
  label: string;
  className: string;
  Icon: typeof Crown;
};

export const roleConfig: Record<UserRole, RoleVisual> = {
  DIRECTORA: {
    label: 'Administradora',
    className: 'border-brand-apricot/30 bg-brand-apricot-soft text-brand-apricot-dark',
    Icon: Crown,
  },
  ASISTENTE: {
    label: 'Asistente',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    Icon: ShieldCheck,
  },
  LIDER_ZONA: {
    label: 'Líder de zona',
    className: 'border-brand-gold/40 bg-[#FBF3D9] text-[#8A6D12]',
    Icon: ShieldCheck,
  },
  CONSULTORA: {
    label: 'Consultora',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Icon: Sparkles,
  },
  SUPER_ADMIN: {
    label: 'Desarrollador',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    Icon: Terminal,
  },
  CLIENTE: {
    label: 'Cliente',
    className: 'border-stone-200 bg-stone-50 text-stone-600',
    Icon: Users,
  },
};

export const editableRoles: UserRole[] = [
  'CONSULTORA',
  'LIDER_ZONA',
  'ASISTENTE',
  'DIRECTORA',
];

export const roleLabel = (role: UserRole): string =>
  (roleConfig[role] ?? roleConfig.CONSULTORA).label;

export const roleCounts = (users: AppUser[]) => ({
  activeDirectors: users.filter((user) => user.role === 'DIRECTORA' && user.active).length,
});
