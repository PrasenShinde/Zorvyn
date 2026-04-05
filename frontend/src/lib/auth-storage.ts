const TOKEN_KEY = 'zorvyn_token'
const ROLE_KEY = 'zorvyn_role'

export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole(): Role | null {
  const r = localStorage.getItem(ROLE_KEY)
  if (r === 'ADMIN' || r === 'ANALYST' || r === 'VIEWER') return r
  return null
}

export function setAuth(token: string, role: Role) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}
