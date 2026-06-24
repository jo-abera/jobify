/**
 * Set new password using token from email link (PATCH /api/auth/reset-password/:token).
 */

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { parseAuthResponse } from '../utils/authResponse';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Stores error messages (e.g. "Invalid token")
  const [loading, setLoading] = useState(false); // Tracks whether request is in progress
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await resetPassword(token, { password });
      const { user, token: jwt } = parseAuthResponse(res);
      login(user, jwt);
      navigate('/tracker');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Reset password
        </h1>
        <p className="text-text-secondary mb-6 text-sm">
          Choose a new password for your account.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rejected text-red-300 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} class="space=y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-primary hover:bg-blue-hover text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Reset password'}
          </button>
        </form>
        <p className="mt-6 text-center text-text-secondary text-sm">
          <Link to="/login" className="text-blue-text hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
