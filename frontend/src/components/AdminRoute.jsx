/**
 * Admin-only route guard.
 *
 * Waits for AuthContext hydration, redirects guests to /login and non-admins
 * to /jobs. Wrap AdminDashboard in App.jsx: <AdminRoute><AdminDashboard /></AdminRoute>
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-text-secondary">
        Loading...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/jobs" replace />

  return children
}
