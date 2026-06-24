/**
 * Login — email/password + Google OAuth redirect + link to forgot password.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login as loginApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { parseAuthResponse } from '../utils/authResponse';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Array Destructuring
  const { login } = useAuth(); // Object Destructuring
  const [searchParams] = useSearchParams();

  // This effect checks the URL query parameters for an error.
  // If the URL contains ?error=google_failed (e.g. after a failed Google login redirect),
  // it updates the error state to show a message to the user.
  // Runs on component mount and whenever searchParams change.

  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'google_failed') {
      setError('Google sign-in failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault(); //Stops the browser from refreshing when the form is submitted
    setError(''); //clears previous errors
    setLoading(true); //shows loading state (like spinner)

    try {
      const res = await loginApi({ email, password });
      const { user, token } = parseAuthResponse(res);
      login(user, token);
      navigate('/tracker');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Welcome back
        </h1>
        <p className="text-text-secondary mb-6">
          Sign in to track your applications
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
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-text-secondary">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-text hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-primary hover:bg-blue-hover text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-text-secondary text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-text hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
