import React from 'react';
import { KeyRound, CheckCircle, Copy, MessageCircle } from 'lucide-react';
import type { AppUser, PasswordResetRequest } from '../../../types';

interface ResetRequestsPanelProps {
  requests: PasswordResetRequest[];
  users: AppUser[];
  copiedId: string | null;
  onApprove: (id: string) => void;
  onCopyPin: (pin: string, id: string) => void;
}

/** Panel de PIN temporales. Se separa de la vista para mantenerla legible. */
export const ResetRequestsPanel: React.FC<ResetRequestsPanelProps> = ({
  requests,
  users,
  copiedId,
  onApprove,
  onCopyPin,
}) => (
  <div className="space-y-4 rounded-3xl border border-brand-gold/30 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
      <h3 className="flex items-center gap-2 font-editorial text-lg font-bold text-stone-900">
        <KeyRound className="h-5 w-5 text-brand-gold" />
        <span>Solicitudes de cambio de contraseña</span>
      </h3>
      <span className="rounded-full border border-brand-gold/30 bg-[#FBF3D9] px-2.5 py-1 text-xs font-semibold text-[#8A6D12]">
        {requests.filter((request) => request.status === 'pending').length} pendientes
      </span>
    </div>

    {requests.length === 0 ? (
      <p className="py-4 text-center text-xs text-stone-400">
        No hay solicitudes de recuperación de clave en este momento.
      </p>
    ) : (
      <div className="divide-y divide-stone-100">
        {requests.map((request) => {
          const target = users.find(
            (user) => user.email.toLowerCase() === request.userEmail.toLowerCase()
          );
          const cleanPhone = (target?.phone || '').replace(/[^0-9]/g, '');
          const message = encodeURIComponent(
            `Hola ${request.userName}. Soy la Directora Yuli. Tu solicitud de cambio de clave fue aprobada. Tu PIN de seguridad es: ${request.pinCode}. Ingrésalo en la pantalla de recuperación para crear tu nueva contraseña.`
          );

          return (
            <div
              key={request.id}
              className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-stone-900">{request.userName}</span>
                  <span className="font-mono text-[10px] text-stone-400">({request.userEmail})</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      request.status === 'approved'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : request.status === 'completed'
                          ? 'bg-stone-100 text-stone-500'
                          : 'border border-brand-gold/30 bg-[#FBF3D9] text-[#8A6D12]'
                    }`}
                  >
                    {request.status === 'approved'
                      ? 'Aprobado'
                      : request.status === 'completed'
                        ? 'Completado'
                        : 'Esperando autorización'}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Cédula: <strong>{request.documentId}</strong> • PIN:{' '}
                  <strong className="font-mono text-brand-apricot-dark">{request.pinCode}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {request.status === 'pending' && (
                  <button
                    onClick={() => onApprove(request.id)}
                    className="flex cursor-pointer items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Aprobar</span>
                  </button>
                )}
                <button
                  onClick={() => onCopyPin(request.pinCode, request.id)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedId === request.id ? '¡Copiado!' : 'Copiar PIN'}</span>
                </button>
                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${message}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
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
);
