/**
 * Global navigation bar.
 *
 * Shows Jobs for everyone; Tracker, Resume, Admin (admins only), and Logout when authenticated.
 * Theme toggle is absolutely positioned on the right (except on auth pages).
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const showThemeToggle = !['/login', '/register'].includes(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDocClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <nav className="relative border-b border-border bg-bg-secondary sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-text shrink-0">
          Jobify
        </Link>

        <div className="flex items-center gap-4 sm:gap-6 flex-nowrap pr-11">
          <Link to="/jobs" className="text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
            Jobs
          </Link>
          {user ? (
            <>
              <Link to="/tracker" className="text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
                Tracker
              </Link>
              <Link to="/resume" className="text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
                Resume
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
                  Admin
                </Link>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-blue-primary/20 text-blue-text text-xs font-semibold flex items-center justify-center border border-blue-primary/40">
                      {getInitials(user.name)}
                    </span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-bg-card border border-border rounded-lg shadow-lg p-2 z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm text-text-primary font-medium truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded"
                    >
                      Profile &amp; Settings
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-rejected rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-primary hover:bg-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      {showThemeToggle && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
      )}
    </nav>
  )
}
