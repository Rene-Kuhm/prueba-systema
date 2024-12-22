import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { auth } from '@/lib/firebase';

export const useAuthInitialization = () => {
  const initializationAttempted = useRef(false);
  const { loadUserProfile } = useAuthStore();
  const [state, setState] = useState({
    isInitialized: false,
    isLoading: true,
    error: null as Error | null
  });

  useEffect(() => {
    if (initializationAttempted.current) {
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      initializationAttempted.current = true;
      
      if (!user) {
        setState({
          isInitialized: true,
          isLoading: false,
          error: null
        });
        return;
      }

      try {
        await loadUserProfile();
        setState({
          isInitialized: true,
          isLoading: false,
          error: null
        });
      } catch (err) {
        setState({
          isInitialized: true,
          isLoading: false,
          error: err instanceof Error ? err : new Error('Failed to initialize auth')
        });
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  return state;
};
