import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_URL } from './constants'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
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

          // Unauthorized - clear auth state and optionally redirect
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname

            // Clear auth from localStorage to prevent stale data
            try {
              const authStorage = localStorage.getItem('auth-storage')
              if (authStorage) {
                const parsed = JSON.parse(authStorage)
                parsed.state.user = null
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
            const publicPaths = ['/', '/login', '/register', '/become-vendor', '/products', '/brands', '/categories', '/cart', '/guest-checkout']
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
