import React, { useState } from 'react';
import { KeyRound, CheckCircle, Copy } from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { useConfig } from '../../context/ConfigContext';

export const AdminUsersView: React.FC = () => {
  const { users, resetRequests, approveResetRequest } = useConfig();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

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
              Administra directoras, líderes de zona y consultoras. Autoriza cambios de clave en 1 clic sin correos SMTP.
            </p>
          </div>
        </div>

        {/* Sección de Seguridad: Solicitudes de Desbloqueo y Cambio de Clave */}
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
              {resetRequests.map((req) => (
                <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900">{req.userName}</span>
                      <span className="text-[10px] text-stone-400">({req.userEmail})</span>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabla de Usuarios y Roles */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 font-editorial text-base font-bold text-stone-900">
            Directorio del Equipo de Ventas
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
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
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
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Activa
                      </span>
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
