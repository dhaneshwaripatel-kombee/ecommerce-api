import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const persistAuth = useCallback((userData, tokenValue) => {
    setUser(userData)
    setToken(tokenValue)
    if (tokenValue) localStorage.setItem('token', tokenValue)
    else localStorage.removeItem('token')
    if (userData) localStorage.setItem('user', JSON.stringify(userData))
    else localStorage.removeItem('user')
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password })
    persistAuth(data.user, data.token)
    return data
  }, [persistAuth])

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload)
    persistAuth(data.user, data.token)
    return data
  }, [persistAuth])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      persistAuth(null, null)
    }
  }, [persistAuth])

  useEffect(() => {
    setLoading(false)
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
