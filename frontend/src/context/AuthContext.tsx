import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import {
  clearAuth,
  getRole,
  getToken,
  setAuth,
  type Role,
} from '../lib/auth-storage'

type AuthContextValue = {
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() => getToken())
  const [role, setRole] = useState<Role | null>(() => getRole())

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ token: string; role: Role }>('/api/auth/login', {
        email,
        password,
      })
      setAuth(data.token, data.role)
      setToken(data.token)
      setRole(data.role)
      navigate('/dashboard', { replace: true })
    },
    [navigate]
  )

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setRole(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, role, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
