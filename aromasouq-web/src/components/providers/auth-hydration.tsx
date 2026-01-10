'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'

/**
 * Component that handles one-time hydration of the auth store from localStorage
 * AND verifies authentication with the server using Authorization header
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

      const initializeAuth = async () => {
        // First rehydrate from localStorage to get the token
        // This is async - we must wait for it to complete!
        await useAuthStore.persist.rehydrate()

        // Now the store has the token from localStorage
        // Verify with server to check if token is still valid
        await fetchUser()

        // Mark as hydrated after server verification completes
        setHasHydrated(true)
      }

      initializeAuth()
    }
  }, [fetchUser, setHasHydrated])

  return null
}
