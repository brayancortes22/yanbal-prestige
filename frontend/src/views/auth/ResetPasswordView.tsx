import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import type { PasswordResetRequest } from '../../types';
import { TurnstileWidget } from '../../components/common/TurnstileWidget';

export const ResetPasswordView: React.FC = () => {
  const { createResetRequest, completeResetPassword, resetRequests } = useConfig();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const [activeRequest, setActiveRequest] = useState<PasswordResetRequest | null>(null);
  const [step, setStep] = useState<'request' | 'verify' | 'new-password' | 'success'>('request');
  const [errorMsg, setErrorMsg] = useState('');

  // Paso 1: Solicitar PIN (con autodesbloqueo por Cédula)
  const handleRequestPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Por favor ingresa tu correo electrónico registrado.');
      return;
    }

    if (!turnstileToken) {
      setErrorMsg('Por favor complete la verificación de seguridad anti-bots.');
      return;
    }

    const req = createResetRequest(email, documentId);
    setActiveRequest(req);

    if (req.status === 'approved') {
      // Autodesbloqueo exitoso por cédula sin esperar a la directora
      setStep('new-password');
    } else {
      // Requiere PIN de la directora o ingresarlo manualmente
      setStep('verify');
    }
  };

  // Paso 2: Validar PIN de 6 dígitos
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!activeRequest) return;

    // Verificar si fue aprobado en segundo plano por la directora
    const currentReq = resetRequests.find((r) => r.id === activeRequest.id) || activeRequest;
    if (currentReq.status === 'approved' || pinInput.trim() === activeRequest.pinCode) {
      setStep('new-password');
    } else {
      setErrorMsg('Código PIN incorrecto o aún no ha sido autorizado por la Directora.');
    }
  };

  // Paso 3: Guardar nueva contraseña
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (activeRequest) {
      completeResetPassword(activeRequest.id);
    }
    setStep('success');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 shadow-lg p-6 sm:p-8 space-y-6">

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            Recuperar Contraseña
          </h2>
          <p className="text-xs text-stone-500">
            Plataforma Segura Yanbal Prestige — Acceso de Consultoras y Directoras
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Paso 1: Solicitud de PIN */}
        {step === 'request' && (
          <form onSubmit={handleRequestPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Correo Electrónico Registrado *</label>
              <input
                type="email"
                required
                placeholder="ejemplo@yanbalprestige.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">Cédula de Ciudadanía (Opcional)</label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Autodesbloqueo 24/7</span>
              </div>
              <input
                type="text"
                placeholder="Ingresa tu cédula para autodesbloqueo inmediato..."
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50/50"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Si coincide con tu registro, el sistema te autorizará al instante sin esperar a la Directora.
              </p>
            </div>

            {/* Cloudflare Turnstile Invisible */}
            <TurnstileWidget onSuccess={(token) => setTurnstileToken(token)} />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Generar Código PIN de Recuperación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Paso 2: Verificación de PIN o Solicitud por WhatsApp a Directora */}
        {step === 'verify' && activeRequest && (
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <strong className="block font-semibold">Solicitud Generada: ID #{activeRequest.id.slice(-4)}</strong>
              <p className="text-[11px] leading-relaxed">
                Pídele a tu Directora Yuli que te autorice en su panel o ingresa el PIN de 6 dígitos:
              </p>
              <a
                href={`https://wa.me/573100000000?text=Hola%20Directora%20Yuli,%20solicit%C3%A9%20restablecer%20mi%20clave%20en%20Yanbal%20Prestige.%20Mi%20PIN%20de%20desbloqueo%20en%20tu%20panel%20es%20${activeRequest.pinCode}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs mt-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Avisar a Directora por WhatsApp</span>
              </a>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Código PIN de 6 Dígitos</label>
              <input
                type="text"
                maxLength={6}
                placeholder="Ej: 482915"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center font-mono text-xl tracking-widest py-2.5 rounded-xl border border-stone-200 bg-stone-50"
              />
              <span className="text-[10px] text-stone-400 block text-center mt-1">
                (PIN Demo asignado: <strong className="text-stone-700">{activeRequest.pinCode}</strong>)
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Validar PIN y Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Paso 3: Ingreso de nueva contraseña */}
        {step === 'new-password' && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identidad validada con éxito. Define tu nueva contraseña:</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                required
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Actualizar Contraseña</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Paso 4: Éxito */}
        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">¡Contraseña Actualizada!</h3>
            <p className="text-xs text-stone-500">
              Tu nueva clave ha sido registrada de forma segura en la base de datos.
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-xs cursor-pointer"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        )}

        <div className="pt-2 text-center text-xs">
          <Link to="/admin/login" className="text-stone-500 hover:text-stone-900">
            Regresar a la página de ingreso
          </Link>
        </div>

      </div>
    </div>
  );
};
