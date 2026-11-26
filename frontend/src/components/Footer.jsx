/**
 * Global footer — matches site canvas / teal tokens (light & dark).
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const year = new Date().getFullYear();

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-text-secondary transition-colors hover:text-blue-text"
    >
      {children}
    </Link>
  );
}

function FooterHeading({ children }) {
  return (
    <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-blue-text mb-4">
      {children}
    </p>
  );
}

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="site-footer mt-auto border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link to="/" className="text-2xl font-bold tracking-tight text-blue-text">
              Jobify
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
              Browse open roles, keep your pipeline organized, and get AI feedback on your resume — all in one
              place.
            </p>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>Explore</FooterHeading>
            <ul className="space-y-2.5">
              <li>
                <FooterLink to="/jobs">Browse jobs</FooterLink>
              </li>
              {user && (
                <>
                  <li>
                    <FooterLink to="/tracker">Application tracker</FooterLink>
                  </li>
                  <li>
                    <FooterLink to="/profile?tab=resume">Resume scoring</FooterLink>
                  </li>
                </>
              )}
              <li>
                <FooterLink to="/">Search from home</FooterLink>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Account</FooterHeading>
            <ul className="space-y-2.5">
              {user ? (
                <>
                  <li>
                    <FooterLink to="/profile">Profile &amp; settings</FooterLink>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <FooterLink to="/admin">Admin dashboard</FooterLink>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <FooterLink to="/login">Log in</FooterLink>
                  </li>
                  <li>
                    <FooterLink to="/register">Create account</FooterLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Product</FooterHeading>
            <ul className="space-y-2.5 text-sm text-text-muted">
              <li>Fresh listings from tracked sources</li>
              <li>Kanban application pipeline</li>
              <li>AI resume feedback</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">© {year} Jobify. All rights reserved.</p>
          <p className="text-xs text-text-muted">Built for job seekers who want less chaos, more momentum.</p>
        </div>
      </div>
    </footer>
  );
}