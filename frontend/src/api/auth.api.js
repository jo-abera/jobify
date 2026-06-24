/**
 * Auth API — mirrors backend /api/auth routes.
 * Responses use { status, token, data: { user } } for login/register/reset flows.
 */
import api from './axios';

export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');

/** Google OAuth starts with a full-page redirect to the backend (Passport). */
export const googleAuthUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
