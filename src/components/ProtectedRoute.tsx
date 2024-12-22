import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuthInitialization } from '../hooks/useAuthInitialization';

interface ProtectedRouteProps {
  children?: React.ReactElement;
  role?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { userProfile } = useAuthStore();
  const { isLoading, isInitialized } = useAuthInitialization();

  if (!isInitialized || isLoading) {
    return null;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (role && userProfile.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};