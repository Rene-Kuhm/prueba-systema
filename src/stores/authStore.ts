import { create } from 'zustand';
import { User, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'technician';
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
  signIn: (email: string, password: string, role: 'admin' | 'technician') => Promise<void>;
  signOut: () => Promise<void>;
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
      set({ loading: true });
      await firebaseSignOut(auth);
      set({ 
        user: null, 
        userProfile: null, 
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error during sign out' 
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));