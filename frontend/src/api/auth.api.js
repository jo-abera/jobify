/**
 * Auth API — mirrors backend /api/auth routes.
 * Responses use { status, token, data: { user } } for login/register/reset flows.
 */
import api from './axios';

export const register = (data) => api.post('/api/auth/register', data);
export const getMe = () => api.get('/api/auth/me')