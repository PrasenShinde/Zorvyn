import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'
import { useState } from 'react'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-svh bg-primary">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onMenuClick={() => setCollapsed((c) => !c)} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
