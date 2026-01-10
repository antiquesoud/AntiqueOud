import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface GuestSessionState {
  sessionToken: string | null

  // Actions
  setSessionToken: (token: string | null) => void
  clearSession: () => void
}

export const useGuestSessionStore = create<GuestSessionState>()(
  persist(
    (set) => ({
      sessionToken: null,

      setSessionToken: (token) => {
        set({ sessionToken: token })
      },

      clearSession: () => {
        set({ sessionToken: null })
      },
    }),
    {
      name: 'guest-session-storage',
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
    }
  )
)

// Helper function to get the current guest session token (for api-client)
export const getGuestSessionToken = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    const storage = localStorage.getItem('guest-session-storage')
    if (storage) {
      const parsed = JSON.parse(storage)
      return parsed.state?.sessionToken || null
    }
  } catch (e) {
    console.error('Failed to get guest session token from storage:', e)
  }
  return null
}

// Helper function to save guest session token from API response
export const saveGuestSessionFromResponse = (response: any): void => {
  if (response?.guest_session) {
    useGuestSessionStore.getState().setSessionToken(response.guest_session)
  }
}
