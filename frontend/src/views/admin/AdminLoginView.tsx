import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginView: React.FC = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'admin' && passwordInput === 'yanbal2026') {
      login('mock_jwt_token_yanbal_prestige_secure', usernameInput);
      navigate(from, { replace: true });
    } else {
      setErrorMsg('Credenciales inválidas. Por favor verifique usuario y contraseña.');
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
            Panel de Administración
          </h2>
          <p className="text-xs text-stone-500">
            Acceso exclusivo para Directoras y Líderes de Yanbal Prestige.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Usuario</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Contraseña</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-orange-500 focus:outline-none text-xs bg-stone-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Iniciar Sesión en el CMS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-amber-600 inline" />
          <span><strong>Credenciales Demo:</strong> Usuario: <code className="text-stone-700 font-semibold">admin</code> / Clave: <code className="text-stone-700 font-semibold">yanbal2026</code></span>
        </div>

      </div>
    </div>
  );
};
