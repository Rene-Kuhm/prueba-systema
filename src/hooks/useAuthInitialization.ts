import { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/stores/authStore';
import { toast } from 'react-toastify';

export const useAuthInitialization = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const authCheckCompleted = useRef(false);

  useEffect(() => {
    let mounted = true;
    
    if (authCheckCompleted.current) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      try {
        if (user && !authCheckCompleted.current) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth state changed:', user.email);
          }
          authCheckCompleted.current = true;
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isLoading, isInitialized };
};
