import React, { useState, useMemo } from 'react';
import { KeyRound, CheckCircle, Copy, Plus, Trash2, Power, UserCheck, X, Edit3, MessageCircle, Search } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { useConfig } from '../../context/ConfigContext';
import type { AppUser, UserRole } from '../../types';

export const AdminUsersView: React.FC = () => {
  const { users, saveUser, toggleUserActive, deleteUser, resetRequests, approveResetRequest } = useConfig();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activas' | 'inactivas'>('todos');

  // Formulario Crear / Editar
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CONSULTORA');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('Zona 12 - Suba');

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setDocumentId('');
    setPhone('');
    setRole('CONSULTORA');
    setZone('Zona 12 - Bogotá');
    setIsEditing(true);
  };

  const handleOpenEdit = (u: AppUser) => {
    setEditId(u.id);
    setName(u.name);
    setEmail(u.email);
    setDocumentId(u.documentId);
    setPhone(u.phone);
    setRole(u.role);
    setZone(u.zone);
    setIsEditing(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !documentId) return;

    const existing = editId ? users.find((u) => u.id === editId) : null;
    const targetUser: AppUser = {
      id: editId || `usr-${Date.now()}`,
      name,
      email,
      role,
      documentId,
      phone,
      zone,
      active: existing ? existing.active : true,
    };

    saveUser(targetUser);
    setIsEditing(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.documentId.includes(searchTerm) ||
        u.zone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = roleFilter === 'todos' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activas' && u.active) ||
        (statusFilter === 'inactivas' && !u.active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <div className="bg-brand-cream min-h-[85vh] animate-fadeIn">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-600 block">
              Control de Accesos & Seguridad
            </span>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Equipo de la Red, Roles & Desbloqueo OTP
            </h2>
            <p className="text-xs text-stone-500">
              Crea, edita datos, activa o desactiva consultoras. Autoriza cambios de clave en 1 clic sin correos SMTP.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Consultora</span>
          </button>
        </div>

        {/* Formulario Crear / Editar */}
        {isEditing && (
          <form onSubmit={handleSaveUser} className="bg-white p-6 rounded-3xl border border-orange-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-editorial text-base font-bold text-stone-900">
                {editId ? 'Editar Integrante de la Red' : 'Registrar Nueva Consultora o Líder'}
              </h3>
              <button type="button" onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <input
                type="email"
                required
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <input
                type="text"
                required
                placeholder="Cédula de Ciudadanía"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-mono"
              />
              <input
                type="text"
                placeholder="WhatsApp (ej: +57 315...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 font-semibold"
              >
                <option value="CONSULTORA">Consultora de Belleza</option>
                <option value="LIDER_ZONA">Líder de Zona</option>
                <option value="DIRECTORA">Directora Independiente</option>
              </select>
              <input
                type="text"
                placeholder="Zona / Municipio"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{editId ? 'Guardar Cambios' : 'Registrar en la Red'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Sección de Seguridad: Solicitudes de Desbloqueo OTP con WhatsApp */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-editorial text-lg font-bold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <span>Solicitudes de Cambio de Contraseña (PIN Temporal de 6 Dígitos)</span>
            </h3>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {resetRequests.filter((r) => r.status === 'pending').length} pendientes de aprobación
            </span>
          </div>

          {resetRequests.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">
              No hay solicitudes de recuperación de clave pendientes en este momento.
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {resetRequests.map((req) => {
                const targetUser = users.find((u) => u.email.toLowerCase() === req.userEmail.toLowerCase());
                const cleanPhone = (targetUser?.phone || '').replace(/[^0-9]/g, '');
                const wpMsg = encodeURIComponent(
                  `Hola ${req.userName}! Soy la Directora Yuli. Tu solicitud de cambio de clave fue aprobada. Tu PIN de seguridad es: ${req.pinCode}. Ingrésalo en la pantalla de recuperación para crear tu nueva contraseña.`
                );

                return (
                  <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-stone-900">{req.userName}</span>
                        <span className="text-[10px] text-stone-400 font-mono">({req.userEmail})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'completed'
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {req.status === 'approved' ? 'Aprobado' : req.status === 'completed' ? 'Completado' : 'Esperando Autorización'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Cédula ingresada: <strong>{req.documentId}</strong> • PIN de seguridad: <strong className="font-mono text-amber-600 text-xs">{req.pinCode}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => approveResetRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aprobar en 1 Clic</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyPin(req.pinCode, req.id)}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedId === req.id ? '¡Copiado!' : 'Copiar PIN'}</span>
                      </button>

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${wpMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Buscador y Filtros de Usuarios */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, cédula o zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todos los Roles</option>
              <option value="DIRECTORA">Directora</option>
              <option value="LIDER_ZONA">Líder de Zona</option>
              <option value="CONSULTORA">Consultora de Belleza</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activas">Solo Activas</option>
              <option value="inactivas">Solo Inactivas</option>
            </select>
          </div>
        </div>

        {/* Tabla de Directorio del Equipo de Ventas */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-editorial text-base font-bold text-stone-900 flex items-center justify-between">
            <span>Directorio del Equipo de Ventas</span>
            <span className="text-xs font-normal text-stone-500 font-sans">
              {filteredUsers.length} integrantes registradas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Cédula</th>
                  <th className="p-4">Zona / Municipio</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="p-4 font-semibold text-stone-900">{u.name}</td>
                    <td className="p-4 text-stone-600 font-mono text-[11px]">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'DIRECTORA'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : u.role === 'LIDER_ZONA'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600 font-mono">{u.documentId}</td>
                    <td className="p-4 text-stone-600">{u.zone}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                        }`}
                        title="Alternar estado: Activa / Inactiva"
                      >
                        <Power className="w-3 h-3" />
                        <span>{u.active ? 'Activa' : 'Inactiva'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-orange-50 text-stone-600 hover:text-orange-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        title="Editar datos"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Deseas dar de baja a ${u.name}?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1.5 text-stone-300 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
