/**
 * Route guard for authenticated pages.
 *
 * Waits for AuthContext loading to finish, then redirects guests to /login.
 * Used in App.jsx for /tracker and /resume.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-center p-8 text-text-muted">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}
