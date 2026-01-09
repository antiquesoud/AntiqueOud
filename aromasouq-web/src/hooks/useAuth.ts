import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, isAuthenticated, isLoading, _hasHydrated, login, register, logout, fetchUser } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    hasHydrated: _hasHydrated,
    login,
    register,
    logout,
    fetchUser,
    isCustomer: user?.role === 'CUSTOMER',
    isVendor: user?.role === 'VENDOR',
    isAdmin: user?.role === 'ADMIN',
  }
}
