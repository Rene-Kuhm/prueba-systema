import { create } from 'zustand';
import { account } from '@/lib/appwrite';
import type { User } from '@/lib/types/appwrite';

interface AuthState {
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  setUserProfile: (profile: User | null) => void;
  signIn: (
    email: string,
    password: string,
    role: 'admin' | 'technician'
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'technician'
  ) => Promise<void>;
  signOut: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  loading: false,
  error: null,
  setUserProfile: (profile) => set({ userProfile: profile }),

  signIn: async (email, password, role) => {
    try {
      set({ loading: true, error: null });

      await account.createSession(email, password);
      const user = await account.get() as unknown as User;

      // Check if the user has the correct role
      if (user.role !== role) {
        throw new Error(`No tienes permisos de ${role}.`);
      }

      set({ userProfile: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName, role) => {
    try {
      set({ loading: true, error: null });

      const { $id } = await account.create(email, password, fullName);

      // Update the user's preferences with the role
      await account.updatePreferences({
        'prefs.role': role,
      }, $id);

      set({ userProfile: { $id, email, name: fullName, role, approved: false } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error en el registro';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });

      await account.deleteSession('current');
      set({ userProfile: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cerrar sesión';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadUserProfile: async () => {
    try {
      set({ loading: true, error: null });

      const user = await account.get() as unknown as User;
      set({ userProfile: user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar perfil';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));