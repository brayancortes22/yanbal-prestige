import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { AppUser, UserRole } from '../../../types';
import { editableRoles, roleConfig } from './roleConfig';

interface RoleBadgeSelectProps {
  user: AppUser;
  onChange: (role: UserRole) => void;
}

/**
 * Etiqueta de rol convertible en selector: la administradora puede cambiar
 * el rol desde la misma fila del directorio, sin entrar al formulario.
 */
export const RoleBadgeSelect: React.FC<RoleBadgeSelectProps> = ({ user, onChange }) => {
  const config = roleConfig[user.role] ?? roleConfig.CONSULTORA;
  const Icon = config.Icon;

  return (
    <span className="relative inline-flex items-center">
      <select
        aria-label={`Cambiar el rol de ${user.name}`}
        title="Cambiar rol"
        value={user.role}
        onChange={(event) => onChange(event.target.value as UserRole)}
        className={`cursor-pointer appearance-none rounded-full border py-0.5 pl-6 pr-5 text-[10px] font-bold outline-none transition-shadow hover:shadow-xs focus-visible:ring-2 focus-visible:ring-brand-apricot/40 ${config.className}`}
      >
        {editableRoles.map((role) => (
          <option key={role} value={role}>
            {(roleConfig[role] ?? roleConfig.CONSULTORA).label}
          </option>
        ))}
      </select>
      <Icon className="pointer-events-none absolute left-2 h-3 w-3" aria-hidden="true" />
      <ChevronDown
        className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-70"
        aria-hidden="true"
      />
    </span>
  );
};
