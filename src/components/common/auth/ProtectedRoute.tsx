import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'technician';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { currentUser, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Mientras se está inicializando o cargando, mostrar nada
  if (!isInitialized || isLoading) {
    return null;
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (role && currentUser.role !== role) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;