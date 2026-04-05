import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { getErrorMessage } from '../lib/api'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email.trim(), password)
      toast.success('Signed in successfully')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error(getErrorMessage(err, 'Invalid credentials'))
      } else {
        toast.error(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-primary px-4 py-12">
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-surface">Zorvyn</h1>
          <p className="mt-2 text-sm text-muted">Executive financial operations</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-secondary p-8 shadow-2xl shadow-black/30">
          <h2 className="mb-6 text-lg font-medium text-surface">Sign in</h2>
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                Email
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-primary/50 py-3 pl-10 pr-4 text-sm text-surface placeholder:text-muted/60 outline-none ring-accent/0 transition focus:border-accent/50 focus:ring-2 focus:ring-accent/30"
                  placeholder="you@company.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                Password
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-primary/50 py-3 pl-10 pr-4 text-sm text-surface placeholder:text-muted/60 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/30"
                  placeholder="••••••••"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-primary shadow-lg shadow-accent/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Secured session · Role-based access after login
        </p>
      </div>
    </div>
  )
}
