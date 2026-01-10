import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_URL } from './constants'
import { getAuthToken } from '@/stores/authStore'
import { getGuestSessionToken, saveGuestSessionFromResponse } from '@/stores/guestSessionStore'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // Keep for backward compatibility with cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add Authorization header and guest session header
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
          // If not authenticated, add guest session header for guest cart/checkout
          const guestSession = getGuestSessionToken()
          if (guestSession) {
            config.headers['X-Guest-Session'] = guestSession
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling and guest session saving
    this.client.interceptors.response.use(
      (response) => {
        // Save guest session token from API responses
        if (response.data?.guest_session) {
          saveGuestSessionFromResponse(response.data)
        }
        return response
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Check if this is a guest endpoint - don't redirect for these
          const requestUrl = error.config?.url || ''
          const guestEndpoints = ['/guest-cart', '/guest-orders', '/guest-checkout']
          const isGuestEndpoint = guestEndpoints.some(endpoint => requestUrl.includes(endpoint))

          // For guest endpoints, just reject without redirect
          if (isGuestEndpoint) {
            return Promise.reject(error)
          }

          // Unauthorized - handle based on current page context
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname

            // Pages that handle their own auth logic - don't interfere
            // Account, admin, vendor pages have their own redirect logic in layouts/pages
            const selfHandledPaths = ['/order-success', '/payment-failed', '/payment-cancelled', '/checkout', '/account', '/admin', '/vendor', '/orders', '/wishlist', '/auth/me']
            const isSelfHandledPath = selfHandledPaths.some(path => currentPath.includes(path))

            // Also check if the request was to /auth/me - let the authStore handle this
            const isAuthMeRequest = requestUrl.includes('/auth/me')

            // Don't clear auth or redirect for pages that handle their own auth
            // or for /auth/me requests (authStore handles these)
            if (isSelfHandledPath || isAuthMeRequest) {
              return Promise.reject(error)
            }

            // Clear auth from localStorage to prevent stale data
            try {
              const authStorage = localStorage.getItem('auth-storage')
              if (authStorage) {
                const parsed = JSON.parse(authStorage)
                parsed.state.user = null
                parsed.state.token = null
                parsed.state.isAuthenticated = false
                localStorage.setItem('auth-storage', JSON.stringify(parsed))
              }
            } catch (e) {
              // If parsing fails, just clear it
              localStorage.removeItem('auth-storage')
            }

            // Special case: If on cart page and got 401 from /cart endpoint
            // This means stale auth - clear storage and reload to re-initialize with guest cart
            if (currentPath.includes('/cart') && requestUrl === '/cart') {
              console.log('Cart page: Cleared stale auth, reloading to use guest cart')
              setTimeout(() => {
                window.location.reload()
              }, 100)
              return Promise.reject(error)
            }

            // Public paths that don't need authentication (including cart and checkout for guest users)
            const publicPaths = ['/', '/login', '/register', '/become-vendor', '/products', '/brands', '/categories', '/cart', '/guest-checkout', '/order-success', '/payment-failed', '/payment-cancelled']
            const isPublicPath = publicPaths.some(path => {
              // Exact match for homepage or starts with for other paths
              if (path === '/') return currentPath === '/' || currentPath.match(/^\/[a-z]{2}$/)
              return currentPath.includes(path)
            })

            // Only redirect if:
            // 1. Not on a public path
            // 2. Not already on login page (prevent loops)
            if (!isPublicPath && !currentPath.includes('/login')) {
              // Use timeout to prevent redirect loop
              setTimeout(() => {
                window.location.href = '/login'
              }, 100)
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // GET request
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  // POST request
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  // PUT request
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data)
    return response.data
  }

  // PATCH request
  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data)
    return response.data
  }

  // DELETE request
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url)
    return response.data
  }

  // File upload
  async uploadFile<T>(url: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Multiple file upload
  async uploadFiles<T>(url: string, files: File[], fieldName: string = 'files'): Promise<T> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append(fieldName, file)
    })

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
