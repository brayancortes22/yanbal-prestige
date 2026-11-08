import React from 'react';
import { Edit3, Power, Trash2, Users } from 'lucide-react';
import type { AppUser, UserRole } from '../../../types';
import { roleConfig, editableRoles } from './roleConfig';
import { RoleBadgeSelect } from './RoleBadgeSelect';

interface UserTableProps {
  users: AppUser[];
  allUsers: AppUser[];
  currentEmail?: string | null;
  canManageRoles?: boolean;
  onChangeRole?: (user: AppUser, role: UserRole) => void;
  onEdit: (user: AppUser) => void;
  onToggle: (id: string) => void;
  onDelete: (user: AppUser) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  allUsers,
  currentEmail,
  canManageRoles = false,
  onChangeRole,
  onEdit,
  onToggle,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 backdrop-blur font-semibold text-stone-500 shadow-2xs">
          <tr>
            <th className="p-4">Nombre</th>
            <th className="p-4">Correo</th>
            <th className="p-4">Rol</th>
            <th className="p-4">Equipo / Líder</th>
            <th className="p-4">Zona</th>
            <th className="p-4">Estado</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-stone-400">
                No hay integrantes que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const config = roleConfig[user.role] ?? roleConfig.CONSULTORA;
              const RoleIcon = config.Icon;
              const leader = allUsers.find((candidate) => candidate.id === user.leaderId);
              const teamSize = allUsers.filter((candidate) => candidate.leaderId === user.id).length;
              const isProtected = user.role === 'SUPER_ADMIN';

              return (
                <tr key={user.id} className="hover:bg-stone-50/50">
                  <td className="p-4">
                    <p className="font-semibold text-stone-900">{user.name}</p>
                    <p className="text-[10px] text-stone-400">{user.phone || 'Sin WhatsApp'}</p>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-stone-600">{user.email}</td>
                  <td className="p-4">
                    {canManageRoles &&
                    onChangeRole &&
                    editableRoles.includes(user.role) &&
                    currentEmail?.toLowerCase() !== user.email.toLowerCase() ? (
                      <RoleBadgeSelect
                        user={user}
                        onChange={(role) => onChangeRole(user, role)}
                      />
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${config.className}`}
                        title={
                          currentEmail?.toLowerCase() === user.email.toLowerCase()
                            ? 'No puedes cambiar tu propio rol'
                            : undefined
                        }
                      >
                        <RoleIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-stone-600">
                    {user.role === 'CONSULTORA' ? (
                      leader ? (
                        <span>
                          {leader.name}
                          <span className="block text-[10px] text-stone-400">{leader.zone}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-brand-apricot">
                          Sin líder asignado
                        </span>
                      )
                    ) : user.role === 'LIDER_ZONA' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-600">
                        <Users className="h-3 w-3" />
                        {teamSize} {teamSize === 1 ? 'consultora' : 'consultoras'}
                      </span>
                    ) : user.role === 'ASISTENTE' ? (
                      <span className="text-[10px] font-semibold text-sky-700">
                        Apoyo administrativo
                      </span>
                    ) : user.role === 'SUPER_ADMIN' ? (
                      <span className="text-[10px] font-semibold text-indigo-700">
                        Soporte técnico
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Toda la red</span>
                    )}
                  </td>
                  <td className="p-4 text-stone-600">{user.zone}</td>
                  <td className="p-4">
                    {isProtected ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700"
                        title="Cuenta protegida: se administra desde variables de entorno"
                      >
                        <Power className="h-3 w-3" />
                        <span>Fija</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onToggle(user.id)}
                        className={`flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                          user.active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-stone-200 bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                        title="Alternar estado"
                      >
                        <Power className="h-3 w-3" />
                        <span>{user.active ? 'Activa' : 'Inactiva'}</span>
                      </button>
                    )}
                  </td>
                  <td className="space-x-1 p-4 text-right">
                    {isProtected ? (
                      <span className="text-[10px] font-semibold text-indigo-600">
                        Cuenta de soporte
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(user)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors hover:bg-brand-apricot-soft hover:text-brand-apricot-dark"
                          title="Editar datos y equipo"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => onDelete(user)}
                          className="cursor-pointer rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
