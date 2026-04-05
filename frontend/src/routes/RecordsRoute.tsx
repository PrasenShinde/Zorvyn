import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** VIEWER must not access records UI; backend would 403 list anyway. */
export function RecordsRoute() {
  const { role } = useAuth()

  if (role === 'VIEWER') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
