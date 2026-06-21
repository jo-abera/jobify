/**
 * Registration — creates account, optional welcome email, then signs in with JWT.
 */
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-card border border-border rounded-card p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Create account
        </h1>

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

        <form className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange
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
              value
              onChange
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
              value
              onChange
              required
              minLength={6}
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
            />
          </div>
          <button
            type="submit"
            disabled
            className="w-full bg-blue-primary hover:bg-blue-hover text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          > Create account</button>
        </form>
        <p className="mt-6 text-center text-text-secondary text-sm">
          Already have an account
          <Link to="/login" className="text-blue-text hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
