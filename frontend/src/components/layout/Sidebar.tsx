import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PanelLeftClose, PanelLeft, Table2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors'
const inactive = 'text-surface/70 hover:bg-white/5 hover:text-surface'
const active = 'bg-accent/15 text-accent'

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { role } = useAuth()
  const showRecords = role === 'ADMIN' || role === 'ANALYST'

  return (
    <aside
      className={`sticky top-0 flex h-svh flex-col border-r border-white/10 bg-secondary transition-[width] duration-200 ${
        collapsed ? 'w-[72px]' : 'w-56'
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-3">
        {!collapsed && (
          <span className="truncate text-lg font-semibold tracking-tight text-surface">Zorvyn</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-surface/80 hover:bg-white/10 hover:text-surface"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
          title="Dashboard"
        >
          <LayoutDashboard className="size-5 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {showRecords && (
          <NavLink
            to="/records"
            className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
            title="Records"
          >
            <Table2 className="size-5 shrink-0" />
            {!collapsed && <span>Records</span>}
          </NavLink>
        )}
      </nav>

      {!collapsed && (
        <p className="border-t border-white/10 px-4 py-3 text-xs text-surface/50">
          60 · 30 · 10 executive palette
        </p>
      )}
    </aside>
  )
}
