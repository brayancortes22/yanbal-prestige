import React, { createContext, useContext, useState } from 'react';
import type { UserRole } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, username: string, role?: UserRole, email?: string) => void;
  logout: () => void;
  username: string | null;
  email: string | null;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('yanbal_auth_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('yanbal_auth_user'));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('yanbal_auth_email'));
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('yanbal_auth_role') as UserRole) || 'DIRECTORA';
  });

  const login = (
    newToken: string,
    newUsername: string,
    newRole: UserRole = 'DIRECTORA',
    newEmail: string = 'yuli.directora@yanbalprestige.com'
  ) => {
    setToken(newToken);
    setUsername(newUsername);
    setRole(newRole);
    setEmail(newEmail);
    localStorage.setItem('yanbal_auth_token', newToken);
    localStorage.setItem('yanbal_auth_user', newUsername);
    localStorage.setItem('yanbal_auth_role', newRole);
    localStorage.setItem('yanbal_auth_email', newEmail);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setEmail(null);
    setRole('DIRECTORA');
    localStorage.removeItem('yanbal_auth_token');
    localStorage.removeItem('yanbal_auth_user');
    localStorage.removeItem('yanbal_auth_role');
    localStorage.removeItem('yanbal_auth_email');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        login,
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
