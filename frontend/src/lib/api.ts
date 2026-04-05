import axios from 'axios'
import { clearAuth, getToken } from './auth-storage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      if (path !== '/login') {
        clearAuth()
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  }
)

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg)) return msg.join(', ')
  }
  if (err instanceof Error) return err.message
  return fallback
}
