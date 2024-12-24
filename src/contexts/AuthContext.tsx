import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthUser {
  uid: string;
  email: string | null;
  role: 'admin' | 'technician';
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  isInitialized: false,
  error: null,
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setError(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          if (userData?.role === 'admin' || userData?.role === 'technician') {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userData.role
            });
          } else {
            await auth.signOut();
            setCurrentUser(null);
            setError('Usuario sin rol válido');
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setCurrentUser(null);
        setError('Error de autenticación');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { currentUser, isLoading, isInitialized, error, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
