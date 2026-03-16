import { useAuthStore } from '../stores/authStore'
import { authApi } from '../lib/api'

export function useAuth() {
  const { token, user, isAuthenticated, login, logout } = useAuthStore()

  const hasPermission = (permission: string) => {
    if (!user) return false
    return user.permissions.includes(permission) || user.is_superuser
  }

  const hasRole = (role: string) => {
    if (!user) return false
    return user.role === role || user.is_superuser
  }

  const isAdmin = () => hasRole('admin') || user?.is_superuser
  const isManager = () => hasRole('manager') || isAdmin()

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
    isAdmin,
    isManager,
  }
}
