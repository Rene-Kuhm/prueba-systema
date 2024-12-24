import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UnauthorizedRouteProps {
  children: ReactNode;
}

const UnauthorizedRoute: React.FC<UnauthorizedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default UnauthorizedRoute;