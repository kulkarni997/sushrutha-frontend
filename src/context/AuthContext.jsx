import { createContext, useState, useEffect } from 'react'
import { decodeJWT } from '../utils/decodeJWT'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sushrutha_token')
    if (token) {
      const decoded = decodeJWT(token)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ id: decoded.sub, role: decoded.role, name: decoded.name, plan: decoded.plan || 'free' })
      } else {
        localStorage.removeItem('sushrutha_token')
      }
    }
    setLoading(false)
  }, [])

  function login(token) {
    localStorage.setItem('sushrutha_token', token)
    const decoded = decodeJWT(token)
    setUser({ id: decoded.sub, role: decoded.role, name: decoded.name, plan: decoded.plan || 'free' })
  }

  function logout() {
    localStorage.removeItem('sushrutha_token')
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
