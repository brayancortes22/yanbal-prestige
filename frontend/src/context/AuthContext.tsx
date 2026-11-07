import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from '../types';
import { api, isApiConfigured } from '../services/api';

const STORAGE = {
  token: 'yanbal_auth_token',
  user: 'yanbal_auth_user',
  email: 'yanbal_auth_email',
  role: 'yanbal_auth_role',
  demo: 'yanbal_auth_demo',
} as const;

const ROLE_ALIASES: Array<[UserRole, string[]]> = [
  ['SUPER_ADMIN', ['6', 'developer', 'desarrollador', 'soporte']],
  ['DIRECTORA', ['1', 'director', 'directora', 'admin']],
  ['ASISTENTE', ['5', 'assistant', 'asistente', 'asistente_administrativa']],
  ['CONSULTORA', ['2', 'consultant', 'consultora']],
  ['LIDER_ZONA', ['4', 'leader', 'lider_zona', 'lider']],
  ['CLIENTE', ['3', 'client', 'cliente']],
];

/**
 * Convierte el rol del backend al rol de UI. Acepta un valor suelto o una
 * lista separada por comas: el JWT del desarrollador incluye `Developer` y
 * `Director`, y debe prevalecer el de mayor privilegio.
 */
export const normalizeRole = (role?: string | number | null): UserRole => {
  const values = String(role ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  for (const [uiRole, aliases] of ROLE_ALIASES) {
    if (values.some((value) => aliases.includes(value))) return uiRole;
  }
  return 'CLIENTE';
};

interface AuthContextType {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  token: string | null;
  login: (token: string, username: string, role?: UserRole, email?: string, demo?: boolean) => void;
  loginWithApi: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  username: string | null;
  email: string | null;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  if (!token.includes('.')) return null;
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const isJwtExpired = (token: string): boolean => {
  if (!token.includes('.')) return false; // token de demostración
  const payload = decodeJwtPayload(token);
  return !payload || (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now());
};

/**
 * El rol se toma del JWT firmado por el backend, no de un valor editable en
 * localStorage. Cambiar `yanbal_auth_role` a mano ya no abre el panel: la API
 * seguiría rechazando las operaciones, pero además la UI deja de creerle.
 */
const roleFromToken = (token: string): UserRole | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const raw =
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload.role ??
    payload['role'];
  return raw ? normalizeRole(raw as string | number) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(STORAGE.token);
    if (stored && isJwtExpired(stored)) {
      localStorage.removeItem(STORAGE.token);
      return null;
    }
    return stored;
  });
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(STORAGE.user)
  );
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem(STORAGE.email));
  const [role, setRole] = useState<UserRole | null>(() => {
    const token = localStorage.getItem(STORAGE.token);
    const fromToken = token ? roleFromToken(token) : null;
    if (fromToken) return fromToken;

    const stored = localStorage.getItem(STORAGE.role);
    return stored ? normalizeRole(stored) : null;
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    () => localStorage.getItem(STORAGE.demo) === 'true'
  );

  const login = (
    newToken: string,
    newUsername: string,
    newRole: UserRole = 'CLIENTE',
    newEmail: string = '',
    demo = false
  ) => {
    // Si el backend emitió un JWT, su claim de rol manda sobre el valor
    // que llegue por parámetro.
    const effectiveRole = roleFromToken(newToken) || newRole;

    setToken(newToken);
    setUsername(newUsername);
    setRole(effectiveRole);
    setEmail(newEmail);
    setIsDemoMode(demo);

    localStorage.setItem(STORAGE.token, newToken);
    localStorage.setItem(STORAGE.user, newUsername);
    localStorage.setItem(STORAGE.role, effectiveRole);
    localStorage.setItem(STORAGE.email, newEmail);
    localStorage.setItem(STORAGE.demo, String(demo));
  };

  const loginWithApi = async (loginEmail: string, password: string): Promise<UserRole> => {
    if (!isApiConfigured()) {
      throw new Error('La API no está configurada en este entorno.');
    }

    const response = await api.login(loginEmail, password);
    if (!response?.success || !response.token || !response.user) {
      throw new Error(response?.message || 'Credenciales incorrectas.');
    }

    const uiRole = roleFromToken(response.token) || normalizeRole(response.user.role);
    login(response.token, response.user.fullName, uiRole, response.user.email, false);
    return uiRole;
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setEmail(null);
    setRole(null);
    setIsDemoMode(false);
    Object.values(STORAGE).forEach((key) => localStorage.removeItem(key));
    // Limpieza de claves legadas.
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !isJwtExpired(token),
        isDemoMode,
        token,
        login,
        loginWithApi,
        logout,
        username,
        email,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
