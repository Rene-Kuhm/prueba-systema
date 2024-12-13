import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  role: 'admin' | 'technician';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { userProfile } = useAuthStore();

  if (!userProfile || !userProfile.approved || userProfile.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};