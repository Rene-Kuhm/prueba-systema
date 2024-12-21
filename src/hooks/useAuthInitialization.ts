import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useAuthInitialization = () => {
  const { loadUserProfile } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (isInitialized) return;

      try {
        await loadUserProfile();
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return { isInitialized, isLoading, error };
};
