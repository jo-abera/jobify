/**
 * Auth API — mirrors backend /api/auth routes.
 * Responses use { status, token, data: { user } } for login/register/reset flows.
 */
import api from './axios'

export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const logout = () => api.post('/api/auth/logout')
export const getMe = () => api.get('/api/auth/me')
export const forgotPassword = (data) => api.post('/api/auth/forgot-password', data)

export const resetPassword = (token, data) => api.patch(`/api/auth/reset-password/${token}`, data)
export const updatePassword = (data) => api.patch('/api/auth/update-password', data)
export const updateProfile = (data) => api.patch('/api/auth/profile', data)
export const updatePreferences = (data) => api.patch('/api/auth/preferences', data)
export const deleteAccount = () => api.delete('/api/auth/delete-account')

/**
 * Upload profile avatar (multipart).
 * Backend uploads to Cloudinary when configured; otherwise stores a data URL.
 */
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return api.post('/api/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** Google OAuth starts with a full-page redirect to the backend (Passport). */
export const googleAuthUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`
