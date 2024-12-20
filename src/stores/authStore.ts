import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface User extends FirebaseUser {
  role: 'admin' | 'technician';
  approved: boolean;
}

interface AuthState {
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  setUserProfile: (profile: User | null) => void;
  signIn: (email: string, password: string, role: 'admin' | 'technician') => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'technician') => Promise<void>;
  signOut: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  loading: false,
  error: null,
  setUserProfile: (profile) => set({ userProfile: profile }),
  clearError: () => set({ error: null }),

  signIn: async (email, password, role) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData?.approved && role === 'technician') {
        throw new Error('Tu cuenta aún no ha sido aprobada. Por favor, espera la aprobación del administrador.');
      }

      if (userData?.role !== role) {
        throw new Error(`No tienes permisos de ${role}.`);
      }

      set({ 
        userProfile: { ...user, ...userData } as User,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signUp: async (email, password, fullName, role) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        fullName,
        role,
        approved: false,
        createdAt: new Date().toISOString()
      });

      set({ 
        userProfile: { ...user, role, approved: false } as User,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en el registro';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ userProfile: null, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  loadUserProfile: async () => {
    try {
      set({ loading: true, error: null });
      return new Promise<void>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            set({ 
              userProfile: { ...user, ...userData } as User,
              loading: false 
            });
          } else {
            set({ userProfile: null, loading: false });
          }
          unsubscribe();
          resolve();
        }, reject);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar perfil';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));