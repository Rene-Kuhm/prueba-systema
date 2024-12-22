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
      if (!mounted || isInitialized) return;

      try {
        await loadUserProfile();
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      initialize();
    }

    return () => {
      mounted = false;
    };
  }, [isInitialized, loadUserProfile]);

  return { isInitialized, isLoading, error };
};
