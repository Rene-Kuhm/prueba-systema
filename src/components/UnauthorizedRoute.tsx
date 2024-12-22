import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuthInitialization } from '../hooks/useAuthInitialization';

export const UnauthorizedRoute = () => {
  const { userProfile } = useAuthStore();
  const { isLoading, isInitialized } = useAuthInitialization();

  if (!isInitialized || isLoading) {
    return null;
  }

  // Redirect to appropriate dashboard based on role if user is authenticated
  if (userProfile) {
    const route = userProfile.role === 'admin' ? '/admin' : '/technician';
    return <Navigate to={route} replace />;
  }

  return <Outlet />;
};
