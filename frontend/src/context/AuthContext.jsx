import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tr_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('tr_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`
      client.get('/auth/me')
        .then(res => {
          setUser(res.data)
          localStorage.setItem('tr_user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('tr_token')
          localStorage.removeItem('tr_user')
          setToken(null)
          setUser(null)
          delete client.defaults.headers.common['Authorization']
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const res = await client.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const { access_token, user: userData } = res.data
    localStorage.setItem('tr_token', access_token)
    localStorage.setItem('tr_user', JSON.stringify(userData))
    client.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    setToken(access_token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('tr_token')
    localStorage.removeItem('tr_user')
    delete client.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fafaf7' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #ff6a13', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
