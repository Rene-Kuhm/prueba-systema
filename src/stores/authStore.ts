import { create } from 'zustand';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'technician';
}

// Add export keyword here
export interface AuthResult {
  user: {
    uid: string;
  };
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string, role: 'admin' | 'technician') => Promise<AuthResult>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'admin' | 'technician') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  signIn: async (email, password, role) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Verify user role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (userData?.role !== role) {
        await auth.signOut();
        throw new Error('Rol no autorizado');
      }

      set({
        user,
        userProfile: {
          uid: user.uid,
          email: user.email!,
          role: userData.role,
          displayName: user.displayName || undefined
        }
      });

      return { user: { uid: user.uid } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ 
        user: null, 
        userProfile: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error durante el cierre de sesión';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar el correo de restablecimiento';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password, role) => {
    try {
      set({ loading: true, error: null });
      
      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        createdAt: new Date().toISOString()
      });

      // Set user profile in state
      set({
        user,
        userProfile: {
          uid: user.uid,
          email: user.email!,
          role,
        }
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error durante el registro';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));

