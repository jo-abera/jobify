/**
 * Registration — creates account, optional welcome email, then signs in with JWT.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { parseAuthResponse } from '../utils/authResponse';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(''); //Array destructuring
  const { login } = useAuth(); // object destructuring
  const navigate = useNavigate(); // Simple variable assignment

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registerApi({ name, email, password });
      const { user, token } = parseAuthResponse(res);
      login(user, token);
      navigate('/tracker');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Create account
        </h1>
        <p className="text-text-secondary mb-6">
          Start tracking your job applications
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rejected text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <GoogleOAuthButton />
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-bg-card text-text-muted">
              or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Password
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
            className="w-full bg-blue-primary hover:bg-blue-hover text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? ' Create account...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-text-secondary text-sm">
          Already have an account?
          <Link to="/login" className="text-blue-text hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
