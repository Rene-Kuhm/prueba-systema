import React, { useCallback } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuthInitialization } from '../hooks/useAuthInitialization';

interface ProtectedRouteProps {
  children?: React.ReactElement;
  role?: string;
}

// Memoize redirect component
const RedirectComponent = React.memo(({ to }: { to: string }) => (
  <Navigate to={to} replace />
));

export const ProtectedRoute: React.FC<ProtectedRouteProps> = React.memo(({ children, role }) => {
  const { userProfile } = useAuthStore();
  const { isLoading, isInitialized } = useAuthInitialization();

  // Memoize the authorization check
  const checkAuthorization = useCallback(() => {
    if (!isInitialized || isLoading) {
      return null;
    }

    if (!userProfile) {
      return <RedirectComponent to="/login" />;
    }

    if (role && userProfile.role !== role) {
      return <RedirectComponent to="/unauthorized" />;
    }

    return children || <Outlet />;
  }, [isInitialized, isLoading, userProfile, role, children]);

  return checkAuthorization();
});

// Add display name for debugging
ProtectedRoute.displayName = 'ProtectedRoute';