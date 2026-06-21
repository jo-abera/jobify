/**
 * Shared Axios instance for all API modules.
 *
 * - baseURL from VITE_API_URL (Render/production) or localhost:5000 in dev.
 * - Attaches JWT from localStorage on every request for protected endpoints.
 *
 * Send HTTP requests (GET, POST, PUT, DELETE)
 * Communicate with your backend API
 * Handle responses easily
 *
 * An interceptor is a middleware for requests.
 * It runs before every request is sent.
 */

import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:500',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
});

export default instance