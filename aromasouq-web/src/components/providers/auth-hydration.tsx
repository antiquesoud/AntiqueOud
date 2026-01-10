'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'

/**
 * Component that handles one-time hydration of the auth store from localStorage
 * AND verifies authentication with the server
 * This prevents SSR/CSR hydration mismatches and should be mounted once in the root layout
 */
export function AuthHydration() {
  const hasInitialized = useRef(false)
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated)

  useEffect(() => {
    // Only initialize once on client-side mount
    if (!hasInitialized.current && typeof window !== 'undefined') {
      hasInitialized.current = true

      console.log('[AuthHydration] Starting auth verification...')

      // First rehydrate from localStorage
      useAuthStore.persist.rehydrate()

      const localStorageAuth = localStorage.getItem('auth-storage')
      console.log('[AuthHydration] localStorage auth:', localStorageAuth ? 'exists' : 'none')

      // Then verify with server - this handles the case where:
      // 1. localStorage is cleared but cookie is still valid
      // 2. Cookie has expired but localStorage still has stale data
      fetchUser()
        .then(() => {
          console.log('[AuthHydration] Server verification SUCCESS - user is authenticated')
        })
        .catch((err) => {
          console.log('[AuthHydration] Server verification FAILED:', err?.response?.status || err?.message || 'unknown error')
        })
        .finally(() => {
          const state = useAuthStore.getState()
          console.log('[AuthHydration] Final state:', { isAuthenticated: state.isAuthenticated, hasUser: !!state.user })
          // Mark as hydrated after server verification completes
          setHasHydrated(true)
        })
    }
  }, [fetchUser, setHasHydrated])

  return null
}
