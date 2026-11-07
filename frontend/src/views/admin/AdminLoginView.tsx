import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, FlaskConical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isApiConfigured } from '../../services/api';
import type { UserRole } from '../../types';

/**
 * Cuentas de demostración exactas (no coincidencias por substring).
 * Solo se aceptan cuando VITE_API_URL está vacía; con API real el login
 * pasa por /api/Auth/login y el backend verifica PBKDF2.
 */
const demoAccounts: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}[] = [
  {
    email: 'yuli.directora@yanbalprestige.com',
    password: 'yanbal2026',
    name: 'Yuli Cortés',
    role: 'DIRECTORA',
  },
  {
    email: 'carolina.consultora@yanbalprestige.com',
    password: 'yanbal2026',
    name: 'Carolina Mejía',
    role: 'CONSULTORA',
  },
  {
    email: 'andrea.lider@yanbalprestige.com',
    password: 'yanbal2026',
    name: 'Andrea Gómez',
    role: 'LIDER_ZONA',
  },
  {
    email: 'laura.asistente@yanbalprestige.com',
    password: 'yanbal2026',
    name: 'Laura Asistente',
    role: 'ASISTENTE',
  },
];

export const AdminLoginView: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithApi } = useAuth();
  const navigate = useNavigate();
  const apiMode = isApiConfigured();

  const redirectByRole = (role: UserRole) => {
    // La líder de zona vende igual que una consultora y además ve su equipo.
    if (role === 'CONSULTORA' || role === 'LIDER_ZONA') {
      navigate('/consultora', { replace: true });
    } else if (role === 'CLIENTE') {
      navigate('/', { replace: true });
    } else {
      navigate('/admin', { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const trimmedEmail = emailInput.trim().toLowerCase();

    try {
      if (apiMode) {
        const role = await loginWithApi(trimmedEmail, passwordInput);
        redirectByRole(role);
        return;
      }

      const account = demoAccounts.find(
        (candidate) =>
          candidate.email === trimmedEmail && candidate.password === passwordInput
      );

      if (!account) {
        setErrorMsg('Correo o contraseña incorrectos. En modo demo use una de las cuentas autorizadas.');
        return;
      }

      login(`demo-${account.role.toLowerCase()}-${Date.now()}`, account.name, account.role, account.email, true);
      redirectByRole(account.role);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-brand-cream px-4 py-20 animate-fadeIn">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl sm:p-10">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-apricot-soft text-brand-apricot">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            Ingreso al sistema Yanbal Prestige
          </h2>
          <p className="text-xs text-stone-500">
            Acceso por rol para Directoras y Consultoras de la red.
          </p>
        </div>

        {apiMode ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            Conexión segura con la API verificada
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-900">
            <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>Modo demostración local.</strong> Sin API configurada los datos viven en
              este navegador. Use las cuentas demo de abajo.
            </span>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-700"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-stone-700">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="username"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="correo@yanbalprestige.com"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-semibold text-stone-700">
                Contraseña
              </label>
              <Link to="/recuperar-clave" className="text-[11px] text-brand-apricot hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-apricot py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-apricot-dark disabled:cursor-wait disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Verificando...' : 'Ingresar'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {!apiMode && (
          <div className="space-y-2 border-t border-stone-100 pt-3">
            <span className="block text-center text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Cuentas de demostración
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmailInput(account.email);
                    setPasswordInput(account.password);
                    setErrorMsg('');
                  }}
                  className="rounded-xl border border-brand-apricot/20 bg-brand-apricot-soft/50 p-2 text-left font-medium text-stone-800 transition-colors hover:bg-brand-apricot-soft"
                >
                  <strong className="block text-brand-apricot-dark">
                    {account.role === 'DIRECTORA'
                      ? 'Administradora'
                      : account.role === 'ASISTENTE'
                        ? 'Asistente'
                        : account.role === 'LIDER_ZONA'
                          ? 'Líder de zona'
                          : 'Consultora'}
                  </strong>
                  <span className="block truncate">{account.email}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-stone-400">
              Contraseña demo: <code className="font-mono">yanbal2026</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
