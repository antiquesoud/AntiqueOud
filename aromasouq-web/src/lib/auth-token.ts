/**
 * Single source of truth for reading auth token from localStorage.
 *
 * This utility exists to:
 * 1. Avoid circular dependencies between api-client.ts and authStore.ts
 * 2. Ensure consistent token reading across the codebase
 *
 * Used by:
 * - api-client.ts: For Authorization header in requests
 * - authStore.ts: In fetchUser() to verify auth with server
 */

const AUTH_STORAGE_KEY = 'auth-storage'

/**
 * Read auth token directly from localStorage.
 * Returns null on server-side or if no valid token exists.
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const storage = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storage) {
      const parsed = JSON.parse(storage)
      return parsed.state?.token || null
    }
  } catch {
    // Silently fail on parse errors
  }
  return null
}
