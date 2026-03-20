import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'fixme_access'
const USER_KEY  = 'fixme_user'

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user,  setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail ?? data.error ?? 'Login failed')

    localStorage.setItem(TOKEN_KEY, data.access)
    const userInfo = { email, name: data.name ?? email.split('@')[0] }
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setToken(data.access)
    setUser(userInfo)
  }, [])

  const register = useCallback(async ({ firstName, lastName, email, password }) => {
    const res = await fetch('/api/auth/users/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = data.email?.[0] ?? data.detail ?? data.error ?? 'Registration failed'
      throw new Error(msg)
    }
    // Auto-login after register
    await login(email, password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
