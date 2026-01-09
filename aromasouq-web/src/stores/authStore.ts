import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  _hasHydrated: boolean // Track hydration status

  // Actions
  setUser: (user: User | null) => void
  setHasHydrated: (state: boolean) => void
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  confirmPassword?: string
  firstName: string
  lastName: string
  phone: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post<{ user: User }>('/auth/login', {
            email,
            password,
          })
          set({ user: response.user, isAuthenticated: true, isLoading: false })
          return response.user // Return user for immediate use
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          // Exclude confirmPassword before sending to API
          const { confirmPassword, ...registerData } = data
          const response = await apiClient.post<{ user: User }>('/auth/register', registerData)
          set({ user: response.user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
          set({ user: null, isAuthenticated: false })
        } catch (error) {
          console.error('Logout failed:', error)
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const user = await apiClient.get<User>('/auth/me')
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client-side
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // Return no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => () => {
        // Note: We no longer set hasHydrated here because we want to wait
        // for server verification in AuthHydration component
        // This prevents premature redirects when localStorage is stale
      },
    }
  )
)
