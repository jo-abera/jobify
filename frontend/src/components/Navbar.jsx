/**
 * Global navigation bar.
 *
 * Shows Jobs for everyone; Tracker, Resume, Admin (admins only), and Logout when authenticated.
 * Theme toggle is absolutely positioned on the right (except on auth pages).
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function () {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showThemeToggle = !['/login', '/register'].includes(pathname); // Only show theme toggle button on pages other than login/register.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) // Detect click outside the menu dropdown
      //If user clicks anywhere outside the menu element, close the menu
      {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoClick);
    return () => document.removeEventListener('mousedown', onDoClick);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="relative border-b border-border bg-bg-secondary sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-text shrink-0">
          Jobify
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 flex-nowrap pr-11">
          <Link
            to="/jobs"
            className="text-text-secondary hover:text-text-primary
            transition-colors whitespace-nowrap"
          >
            Jobs
          </Link>
          <Link
            to="/login"
            className="text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-blue-primary hover:bg-blue-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Sign up
          </Link>
        </div>
      </div>
      {showThemeToggle && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2"></div>
      )}
    </nav>
  );
}
