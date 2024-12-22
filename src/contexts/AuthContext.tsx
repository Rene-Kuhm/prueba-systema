import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../stores/authStore';

interface AuthContextType {
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { setUserProfile } = useAuthStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const userDataCache = new Map();

    const handleAuthStateChange = async (user: any) => {
      try {
        if (user) {
          // Check cache first
          if (!userDataCache.has(user.uid)) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            userDataCache.set(user.uid, userData);
          }
          
          const userData = userDataCache.get(user.uid);
          const savedRole = localStorage.getItem('userRole');
          
          setUserProfile({
            ...user,
            ...userData,
            role: savedRole || userData?.role
          });
        } else {
          setUserProfile(null);
          localStorage.removeItem('userRole');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Auth error'));
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth listener
    unsubscribeRef.current = onAuthStateChanged(auth, handleAuthStateChange);

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      userDataCache.clear();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
