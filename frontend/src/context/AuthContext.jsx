/**
 * Authentication context.
 *
 * Stores JWT in localStorage, hydrates user via GET /api/auth/me on load.
 * login() accepts { user, token } from register/login/reset/OAuth callback.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api/auth.api';
import { parseMeResponse } from '../utils/authResponse';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setUser(parseMeResponse(res)))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    if (token) localStorage.setItem('token', token);
    if (userData) setUser(userData);
    getMe()
      .then((res) => setUser(parseMeResponse(res)))
      .catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
