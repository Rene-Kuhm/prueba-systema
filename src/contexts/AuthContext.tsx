import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleError = (error: unknown) => {
    console.error('Auth error:', error);
    setError(error instanceof Error ? error.message : 'Error de autenticación');
    setIsLoading(false);
    setIsInitialized(true);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setError(null);
      setIsLoading(false);
      setIsInitialized(true);
      navigate('/login'); // Redirección única
    } catch (error) {
      handleError(error);
    }
  };

  const processUser = async (user: User | null) => {
    if (!user) {
      setCurrentUser(null);
      setError(null);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData || (userData.role !== 'admin' && userData.role !== 'technician')) {
        throw new Error('Usuario no válido o sin rol válido');
      }

      setCurrentUser({
        uid: user.uid,
        email: user.email,
        role: userData.role,
      });
      setError(null);
    } catch (error) {
      setCurrentUser(null);
      setError(error instanceof Error ? error.message : 'Error al procesar usuario');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        await processUser(user); // Procesa el usuario
      } catch (error) {
        handleError(error);
      }
    });
    return () => unsubscribe();
  }, []);

  const contextValue: AuthContextType = {
    currentUser,
    isLoading,
    isInitialized,
    error,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
