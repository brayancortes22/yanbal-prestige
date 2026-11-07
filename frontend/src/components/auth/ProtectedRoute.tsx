import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles autorizados para la sección. Sin lista, solo exige sesión. */
  allowedRoles?: UserRole[];
}

/**
 * Guarda de rutas en dos capas: sesión válida y rol autorizado.
 * La UI no es una frontera de seguridad (el backend valida el JWT), pero
 * evita que una consultora vea pantallas de administración por error.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    const destination = role === 'CONSULTORA' ? '/consultora' : '/';
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
