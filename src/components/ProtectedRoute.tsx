import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  role: 'admin' | 'technician';
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();

  useEffect(() => {
    // Redirect if no profile or unauthorized access
    if (!userProfile || !userProfile.approved || userProfile.role !== role) {
      navigate('/');
    }
  }, [userProfile, role, navigate]);

  // Show fallback or null if conditions are not met
  if (!userProfile || !userProfile.approved || userProfile.role !== role) {
    return <div>Redirecting...</div>; // Placeholder for better UX
  }

  return <>{children}</>;
}
