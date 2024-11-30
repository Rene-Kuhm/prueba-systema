import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types/supabase'

interface AuthState {
  userProfile: Profile | null
  loading: boolean
  error: string | null
  signIn: (
    email: string,
    password: string,
    role: 'admin' | 'technician',
  ) => Promise<void>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'technician',
  ) => Promise<void>
  signOut: () => Promise<void>
  loadUserProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  loading: false,
  error: null,

  signIn: async (email, password, role) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw new Error(`Error de inicio de sesión: ${error.message}`)
      if (!data.user) throw new Error('No se encontraron datos del usuario.')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError)
        throw new Error(`Error al obtener perfil: ${profileError.message}`)
      if (!profile) throw new Error('No se encontró el perfil del usuario.')
      if (!profile.approved)
        throw new Error('Tu cuenta está pendiente de aprobación.')
      if (profile.role !== role)
        throw new Error(`No tienes permisos de ${role}.`)

      set({ userProfile: profile })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email, password, fullName, role) => {
    try {
      set({ loading: true, error: null })

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (signUpError)
        throw new Error(`Error de registro: ${signUpError.message}`)
      if (!data.user) throw new Error('No se pudo crear el usuario.')

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            full_name: fullName,
            role: role,
            approved: false,
          },
        ])
        .select()
        .single()

      if (profileError)
        throw new Error(`Error al crear perfil: ${profileError.message}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error en el registro'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(`Error al cerrar sesión: ${error.message}`)

      set({ userProfile: null })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cerrar sesión'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  loadUserProfile: async (userId) => {
    try {
      set({ loading: true, error: null })

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw new Error(`Error al cargar perfil: ${error.message}`)
      if (!profile) throw new Error('No se encontró el perfil del usuario.')

      set({ userProfile: profile })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar perfil'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))
