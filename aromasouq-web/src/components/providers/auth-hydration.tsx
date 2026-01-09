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

      // First rehydrate from localStorage
      useAuthStore.persist.rehydrate()

      // Then verify with server - this handles the case where:
      // 1. localStorage is cleared but cookie is still valid
      // 2. Cookie has expired but localStorage still has stale data
      fetchUser().finally(() => {
        // Mark as hydrated after server verification completes
        setHasHydrated(true)
      })
    }
  }, [fetchUser, setHasHydrated])

  return null
}
