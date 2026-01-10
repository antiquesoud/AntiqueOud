import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'

interface AuthState {
  user: User | null
  token: string | null // JWT token for Authorization header
  isAuthenticated: boolean
  isLoading: boolean
  _hasHydrated: boolean // Track hydration status

  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
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

interface LoginResponse {
  user: User
  access_token: string
  message: string
  cartMerged?: boolean
}

interface RegisterResponse {
  user: User
  access_token: string
  message: string
  cartMerged?: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },

      setToken: (token) => {
        set({ token })
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
          })
          console.log('[authStore] Login successful, storing token')
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false
          })
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
          const response = await apiClient.post<RegisterResponse>('/auth/register', registerData)
          console.log('[authStore] Registration successful, storing token')
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
        } catch (error) {
          console.error('Logout API call failed:', error)
        } finally {
          // Always clear local state regardless of API call result
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      fetchUser: async () => {
        const { token } = get()

        // If no token, user is definitely not authenticated
        if (!token) {
          console.log('[authStore] No token found, skipping /auth/me')
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          console.log('[authStore] Calling /auth/me with token...')
          const response = await apiClient.get<{ user: User }>('/auth/me')
          console.log('[authStore] /auth/me SUCCESS:', response.user?.email)
          set({ user: response.user, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          console.log('[authStore] /auth/me FAILED:', error?.response?.status, error?.message)
          // Token is invalid, clear everything
          set({ user: null, token: null, isAuthenticated: false, isLoading: false })
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
      // Persist user, token, and isAuthenticated
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => () => {
        // Note: We no longer set hasHydrated here because we want to wait
        // for server verification in AuthHydration component
        // This prevents premature redirects when localStorage is stale
      },
    }
  )
)

// Helper function to get the current token (for api-client)
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    const storage = localStorage.getItem('auth-storage')
    if (storage) {
      const parsed = JSON.parse(storage)
      return parsed.state?.token || null
    }
  } catch (e) {
    console.error('Failed to get auth token from storage:', e)
  }
  return null
}
