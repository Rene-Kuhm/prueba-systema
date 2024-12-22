import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { persist } from 'zustand/middleware';

interface User extends Omit<FirebaseUser, 'toJSON'> {
  role: 'admin' | 'technician';
  approved: boolean;
  fullName?: string;
}

interface AuthState {
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  setUserProfile: (profile: User | null) => void;
  signIn: (email: string, password: string, role: 'admin' | 'technician') => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'technician') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  loadUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      loading: false,
      error: null,
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      clearError: () => set({ error: null }),

      signIn: async (email, password, role) => {
        try {
          set({ loading: true, error: null });
          await setPersistence(auth, browserLocalPersistence);
          
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

          localStorage.setItem('userRole', role);

          set({ 
            userProfile: { ...user, ...userData, role } as unknown as User,
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
          localStorage.removeItem('userRole');
          set({ userProfile: null, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      loadUserProfile: async () => {
        const currentState = get();
        
        if (currentState.userProfile || currentState.loading) {
          return;
        }

        try {
          set({ loading: true });
          const user = auth.currentUser;
          
          if (!user) {
            set({ loading: false });
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          if (!userData) {
            set({ loading: false });
            return;
          }

          const userProfile: User = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            isAnonymous: user.isAnonymous,
            providerId: user.providerId,
            displayName: user.displayName,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            metadata: user.metadata,
            providerData: user.providerData,
            refreshToken: user.refreshToken,
            tenantId: user.tenantId,
            delete: user.delete.bind(user),
            getIdToken: user.getIdToken.bind(user),
            getIdTokenResult: user.getIdTokenResult.bind(user),
            reload: user.reload.bind(user),
            role: userData.role as 'admin' | 'technician',
            approved: userData.approved as boolean,
            fullName: userData.fullName
          } as const;

          set({ 
            userProfile,
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ userProfile: state.userProfile }),
    }
  )
);