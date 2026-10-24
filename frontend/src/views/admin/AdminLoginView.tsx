import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';

export const AdminLoginView: React.FC = () => {
  const [emailInput, setEmailInput] = useState('yuli.directora@yanbalprestige.com');
  const [passwordInput, setPasswordInput] = useState('yanbal2026');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const { users } = useConfig();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = emailInput.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (matchedUser || trimmedEmail.includes('admin') || trimmedEmail.includes('directora') || trimmedEmail.includes('consultora')) {
      const userRole = matchedUser ? matchedUser.role : trimmedEmail.includes('consultora') ? 'CONSULTORA' : 'DIRECTORA';
      const userName = matchedUser ? matchedUser.name : trimmedEmail.includes('consultora') ? 'Carolina Mejía' : 'Yuli Cortés';

      login('jwt_token_secure_yanbal_prestige', userName, userRole, trimmedEmail);

      // Redirección inteligente según el rol (Inspirado en autogestion-sena)
      if (userRole === 'CONSULTORA') {
        navigate('/consultora', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } else {
      setErrorMsg('Usuario o correo no reconocido. Verifique sus credenciales.');
    }
  };

  return (
    <div className="py-20 bg-brand-cream min-h-[75vh] flex items-center justify-center px-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            Ingreso al Sistema Yanbal Prestige
          </h2>
          <p className="text-xs text-stone-500">
            Acceso unificado con redirección inteligente por rol (Directora / Consultora).
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="correo@yanbalprestige.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">Contraseña</label>
              <Link to="/recuperar-clave" className="text-[11px] text-orange-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Ingresar al Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Acceso rápido a perfiles de demostración */}
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <span className="text-[10px] text-stone-400 uppercase tracking-widest block text-center font-bold">
            Perfiles Demo para Mostrar a Yuli:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setEmailInput('yuli.directora@yanbalprestige.com');
                setPasswordInput('yanbal2026');
              }}
              className="p-2 rounded-xl border border-orange-200 bg-orange-50/50 text-orange-950 font-medium text-left hover:bg-orange-100 transition-colors"
            >
              <strong className="block text-orange-700">Rol: Directora</strong>
              <span>yuli.directora@...</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmailInput('carolina.consultora@yanbalprestige.com');
                setPasswordInput('yanbal2026');
              }}
              className="p-2 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-950 font-medium text-left hover:bg-amber-100 transition-colors"
            >
              <strong className="block text-amber-700">Rol: Consultora</strong>
              <span>carolina.consultora@...</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
