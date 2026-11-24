import { Link } from 'react-router-dom';

const AUTH_LINKS = [
  { to: '/tracker', label: 'Tracker' },
  { to: '/resume', label: 'Resume' },
  { to: '/admin', label: 'Admin', adminOnly: true },
];

export function NavbarNav({ pathname, user }) {
  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const links = [
    { to: '/jobs', label: 'Jobs' },
    ...(user
      ? AUTH_LINKS.filter((l) => !l.adminOnly || user.role === 'admin')
      : [{ to: '/login', label: 'Login' }]),
  ];

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`nav-link${isActive(to) ? ' nav-link-active' : ''}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}