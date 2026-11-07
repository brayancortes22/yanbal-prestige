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

/** Convierte el rol del backend (`Director`, `Consultant`, `Client`) al rol de UI. */
export const normalizeRole = (role?: string | null): UserRole => {
  switch ((role || '').toLowerCase()) {
    case 'director':
    case 'directora':
    case 'admin':
      return 'DIRECTORA';
    case 'consultant':
    case 'consultora':
      return 'CONSULTORA';
    case 'client':
    case 'cliente':
      return 'CLIENTE';
    case 'lider_zona':
    case 'lider':
      return 'LIDER_ZONA';
    default:
      return 'CLIENTE';
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (token: string, username: string, role?: UserRole, email?: string, demo?: boolean) => void;
  loginWithApi: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  username: string | null;
  email: string | null;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isJwtExpired = (token: string): boolean => {
  if (!token.includes('.')) return false; // token de demostración
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
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
    setToken(newToken);
    setUsername(newUsername);
    setRole(newRole);
    setEmail(newEmail);
    setIsDemoMode(demo);

    localStorage.setItem(STORAGE.token, newToken);
    localStorage.setItem(STORAGE.user, newUsername);
    localStorage.setItem(STORAGE.role, newRole);
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

    const uiRole = normalizeRole(response.user.role);
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
