/**
 * Request password reset email (POST /api/auth/forgot-password).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // e is the event object from the form submission ===Prevents the default form behavior (which is page reload)
    setError(''); // clears previous errors
    setMessage(''); // clears previous success message
    setLoading(true); // shows a loading state (spinner, disabled button, etc.)

    try {
      const res = await forgotPassword({ email });
      setMessage(
        res.data.message || 'If that email exists, we sent a reset link'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed'); // ?. is optional chaining (prevents crash if undefined)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Forgot password
        </h1>
        <p className="text-text-secondary mb-6 text-sm">
          Enter your email and we will send a reset link (valid 10 minutes).
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rejected text-red-300 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 rounded-lg bg-offered text-green-300 text-sm">
            {message}
          </div>
        )}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-primary hover:bg-blue-hover text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
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
