/**
 * OAuth callback — backend redirects here with ?token= after Google login.
 * Stores JWT, loads profile via /api/auth/me, then sends user to /jobs.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/auth.api';
import { parseMeResponse } from '../utils/authResponse';

export default function AuthCallback() {
  const navigate = useNavigate();
  const login = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      navigate('/login?error=google_failed');
      return;
    }
    if (token) {
      localStorage.setItem('token', token);
      getMe()
        .then((res) => {
          const user = parseMeResponse(res);
          login(user, token);
          navigate('/jobs');
        })
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-bg-primary">
      <p className="text-text-primary text-lg">Logging you in...</p>
    </div>
  );
}
