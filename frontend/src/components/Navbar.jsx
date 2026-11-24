/**
 * Global navigation bar — centered links layout.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { NavbarNav } from './nav/NavbarNav'

function UserMenu({ user, pathname, menuRef, menuOpen, setMenuOpen, onLogout }) {
  const navActive = (to) => pathname === to || pathname.startsWith(`${to}/`)

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }

  return (
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
            className="h-8 w-8 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-primary/40 bg-blue-primary/20 text-xs font-semibold text-blue-text">
            {getInitials(user.name)}
          </span>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-border bg-bg-card p-2 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className={`block rounded px-3 py-2 text-sm hover:bg-bg-hover ${
              navActive('/profile')
                ? 'font-semibold text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Profile &amp; Settings
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-rejected"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

function NavActions({ user, pathname, menuRef, menuOpen, setMenuOpen, onLogout }) {
  if (user) {
    return (
      <UserMenu
        user={user}
        pathname={pathname}
        menuRef={menuRef}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onLogout={onLogout}
      />
    )
  }

  return (
    <Link
      to="/register"
      className="whitespace-nowrap rounded-lg bg-blue-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-hover"
    >
      Sign up
    </Link>
  )
}

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

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg-secondary">
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Mobile: logo + actions on row 1, nav links on row 2 (avoids squeezing links off-screen). */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2 py-2 md:grid-cols-[1fr_auto_1fr] md:h-14 md:gap-2 md:py-0">
          <Link
            to="/"
            className="col-start-1 row-start-1 shrink-0 text-xl font-bold tracking-tight text-blue-text"
          >
            Jobify
          </Link>
          <div className="col-start-2 row-start-1 flex items-center justify-end gap-2.5 md:col-start-3">
            {showThemeToggle && <ThemeToggle />}
            <NavActions
              user={user}
              pathname={pathname}
              menuRef={menuRef}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onLogout={handleLogout}
            />
          </div>
          <div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:justify-self-center">
            <NavbarNav pathname={pathname} user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}