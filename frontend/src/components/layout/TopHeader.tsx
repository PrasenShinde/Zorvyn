import { LogOut, Menu, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { role, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-secondary/95 px-4 backdrop-blur md:px-8">
      <button
        type="button"
        className="rounded-lg p-2 text-surface/80 hover:bg-white/10 md:hidden"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden flex-1 md:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-primary/60 px-3 py-1.5 text-xs font-medium text-surface">
          <Shield className="size-3.5 text-accent" aria-hidden />
          <span className="text-muted">Role</span>
          <span className="rounded bg-accent/20 px-2 py-0.5 text-accent">{role ?? '—'}</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-primary/40 px-3 py-2 text-sm font-medium text-surface transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
