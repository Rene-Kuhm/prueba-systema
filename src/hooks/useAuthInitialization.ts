import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

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

    initializationAttempted.current = true;
    
    loadUserProfile()
      .then(() => {
        setState({
          isInitialized: true,
          isLoading: false,
          error: null
        });
      })
      .catch((err) => {
        setState({
          isInitialized: true,
          isLoading: false,
          error: err instanceof Error ? err : new Error('Failed to initialize auth')
        });
      });
  }, []); // Empty dependency array since we use ref for tracking

  return state;
};
