import { Link, useLocation } from 'react-router-dom';

const AUTH_LINKS = [
  { to: '/tracker', label: 'Tracker' },
  { to: '/profile?tab=resume', label: 'Resume', profileResume: true },
  { to: '/admin', label: 'Admin', adminOnly: true },
];

export function NavbarNav({ pathname, user }) {
  const { search } = useLocation();
  const profileTab = new URLSearchParams(search).get('tab');

  const isActive = (to, profileResume) => {
    if (to === '/') return pathname === '/';
    if (profileResume) {
      return pathname === '/profile' && profileTab === 'resume';
    }
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const links = [
    { to: '/jobs', label: 'Jobs' },
    ...(user
      ? AUTH_LINKS.filter((l) => !l.adminOnly || user.role === 'admin')
      : [{ to: '/login', label: 'Login' }]),
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-6 md:flex-nowrap">
      {links.map(({ to, label, profileResume }) => (
        <Link
          key={to}
          to={to}
          className={`nav-link${isActive(to, profileResume) ? ' nav-link-active' : ''}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}