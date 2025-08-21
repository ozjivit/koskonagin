import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, signup as apiSignup, logout as apiLogout, fetchMe } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const me = await fetchMe(token)
        if (me?.ok) setUser(me.user)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [token])

  function setAuth(newToken, newUser) {
    setToken(newToken)
    setUser(newUser || null)
    if (newToken) localStorage.setItem('auth_token', newToken)
    else localStorage.removeItem('auth_token')
  }

  async function login(credentials) {
    const res = await apiLogin(credentials)
    if (res.ok) setAuth(res.token, res.user)
    return res
  }

  async function signup(data) {
    const res = await apiSignup(data)
    if (res.ok) setAuth(res.token, res.user)
    return res
  }

  async function logout() {
    try { await apiLogout(token) } catch {}
    setAuth('', null)
  }

  const value = useMemo(() => ({ token, user, loading, login, signup, logout }), [token, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


