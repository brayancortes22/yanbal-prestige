import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight, CheckCircle, MailCheck } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { api, isApiConfigured } from '../../services/api';
import { TurnstileWidget } from '../../components/common/TurnstileWidget';
import { isTurnstileEnabled } from '../../config/turnstile';

type Step = 'request' | 'verify' | 'new-password' | 'success';

/**
 * Recuperación por PIN. Con API configurada llama al backend (PIN
 * criptográfico, hash PBKDF2 y sin autodesbloqueo por cédula). En modo
 * demo usa el almacenamiento local y muestra el PIN solo para poder probar.
 */
export const ResetPasswordView: React.FC = () => {
  const { users, createResetRequest, completeResetPassword } = useConfig();
  const navigate = useNavigate();
  const apiMode = isApiConfigured();

  const [email, setEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [demoPin, setDemoPin] = useState('');
  const [requestId, setRequestId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Ingresa tu correo electrónico registrado.');
      return;
    }

    if (isTurnstileEnabled && !turnstileToken) {
      setErrorMsg('Completa la verificación de seguridad anti-bots.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (apiMode) {
        const result = await api.requestPin(email.trim().toLowerCase(), turnstileToken);
        if (!result.success) {
          setErrorMsg(result.message || 'No fue posible generar el PIN.');
          return;
        }
        setDemoPin(result.pin || '');
      } else {
        const user = users.find(
          (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.active
        );
        if (!user) {
          setErrorMsg('No existe una cuenta activa con ese correo.');
          return;
        }
        const request = createResetRequest(user.email, user.documentId);
        setRequestId(request.id);
        setDemoPin(request.pinCode);
      }

      setStep('verify');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!/^\d{6}$/.test(pinInput.trim())) {
      setErrorMsg('El PIN debe tener exactamente 6 dígitos.');
      return;
    }

    // En modo demo se compara localmente; con API el backend valida el PIN
    // junto con la nueva contraseña en el siguiente paso.
    if (!apiMode && pinInput.trim() !== demoPin) {
      setErrorMsg('PIN incorrecto o expirado. Solicita uno nuevo.');
      return;
    }

    setStep('new-password');
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (apiMode) {
        const result = await api.resetPassword(
          email.trim().toLowerCase(),
          pinInput.trim(),
          newPassword,
          turnstileToken
        );
        if (!result.success) {
          setErrorMsg(result.message || 'PIN inválido o expirado.');
          return;
        }
      } else if (requestId) {
        completeResetPassword(requestId);
      }

      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg sm:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-apricot-soft text-brand-apricot">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">Recuperar contraseña</h2>
          <p className="text-xs text-stone-500">
            Acceso seguro para consultoras y directoras de la red.
          </p>
        </div>

        {errorMsg && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestPin} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="mb-1 block text-xs font-semibold text-stone-700">
                Correo electrónico registrado *
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                placeholder="ejemplo@yanbalprestige.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs"
              />
            </div>

            <TurnstileWidget onSuccess={(token) => setTurnstileToken(token)} />

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-apricot py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-brand-apricot-dark disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Generando...' : 'Generar PIN de recuperación'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-2 rounded-2xl border border-[#EADFD3] bg-brand-sand/40 p-3.5 text-xs text-stone-700">
              <strong className="flex items-center gap-1.5 font-semibold text-stone-900">
                <MailCheck className="h-4 w-4 text-brand-apricot" />
                Revisa tu correo
              </strong>
              <p className="text-[11px] leading-relaxed">
                Enviamos un PIN de 6 dígitos a <strong>{email}</strong>.
                {demoPin && (
                  <span className="mt-1 block rounded-lg bg-white/70 px-2 py-1 font-mono text-[11px] text-stone-800">
                    PIN demo: <strong>{demoPin}</strong>
                  </span>
                )}
              </p>
            </div>

            <div>
              <label htmlFor="reset-pin" className="mb-1 block text-xs font-semibold text-stone-700">
                Código PIN de 6 dígitos
              </label>
              <input
                id="reset-pin"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-center font-mono text-xl tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-apricot py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-brand-apricot-dark"
            >
              <span>Validar PIN y continuar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 'new-password' && (
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Identidad validada. Define tu nueva contraseña:</span>
            </div>

            <div>
              <label htmlFor="new-password" className="mb-1 block text-xs font-semibold text-stone-700">
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres, una letra y un número"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold text-stone-700">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-apricot py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-brand-apricot-dark disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-stone-900">¡Contraseña actualizada!</h3>
            <p className="text-xs text-stone-500">Ya puedes ingresar con tu nueva contraseña.</p>
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="w-full cursor-pointer rounded-xl bg-stone-900 py-3 text-xs font-semibold text-white"
            >
              Ir a iniciar sesión
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
