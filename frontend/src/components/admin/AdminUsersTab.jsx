import { useEffect, useMemo, useState } from 'react';
import JobPagination from '../JobPagination';
import { formatDate } from '../../utils/formatDate';

const PAGE_SIZE = 15;

function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function AdminUsersTab({ users, loading, onBan, onPromote, onDelete }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const summary = useMemo(() => {
    const admins = users.filter((u) => u.role === 'admin').length;
    const banned = users.filter((u) => u.isBanned).length;
    return { admins, banned };
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = users;

    if (filter === 'admin') list = list.filter((u) => u.role === 'admin');
    else if (filter === 'banned') list = list.filter((u) => u.isBanned);
    else if (filter === 'unverified') list = list.filter((u) => !u.isVerified);

    if (q) {
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    const bySort = (a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'applications') {
        return (b._count?.savedJobs ?? 0) - (a._count?.savedJobs ?? 0);
      }
      return 0;
    };
    sorted.sort((a, b) => {
      const adminFirst = (a.role === 'admin' ? 0 : 1) - (b.role === 'admin' ? 0 : 1);
      if (adminFirst !== 0) return adminFirst;
      return bySort(a, b);
    });
    return sorted;
  }, [users, query, filter, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, sort, filter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageUsers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pagination = {
    page: safePage,
    totalPages,
    total,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };

  if (loading) {
    return <p className="text-text-secondary">Loading users…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-text-primary">{filtered.length}</span>
          {query || filter !== 'all' ? ' matching' : ''} users ·{' '}
          <span className="font-semibold text-text-primary">{summary.admins}</span> admins ·{' '}
          <span className="font-semibold text-text-primary">{summary.banned}</span> banned
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-border-hover focus:outline-none focus:ring-0 sm:w-56"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-border-hover focus:outline-none focus:ring-0"
          >
            <option value="all">All users</option>
            <option value="admin">Admins only</option>
            <option value="banned">Banned only</option>
            <option value="unverified">Unverified only</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-border-hover focus:outline-none focus:ring-0"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="applications">Most applications</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card px-6 py-12 text-center">
          <p className="text-text-secondary">
            {users.length === 0 ? 'No users in the database.' : 'No users match your filters.'}
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {pageUsers.map((user) => {
              const apps = user._count?.savedJobs ?? 0;
              const initials = getInitials(user.name);

              return (
                <li
                  key={user.id}
                  className="rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-border-hover md:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          user.isBanned
                            ? 'border-border bg-bg-secondary text-text-muted'
                            : 'border-blue-primary/30 bg-blue-light text-blue-text'
                        }`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-text-primary">{user.name}</h3>
                          {user.role === 'admin' && (
                            <span className="rounded-full bg-blue-light px-2 py-0.5 text-xs font-medium text-blue-text">
                              Admin
                            </span>
                          )}
                          {user.isBanned && (
                            <span className="rounded-full bg-rejected px-2 py-0.5 text-xs font-medium text-red-300">
                              Banned
                            </span>
                          )}
                          {!user.isVerified && (
                            <span className="rounded-full bg-interviewing/50 px-2 py-0.5 text-xs font-medium text-amber-900 dark:text-amber-200">
                              Unverified
                            </span>
                          )}
                          {user.googleId && (
                            <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
                              Google
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-text-secondary">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
                            {apps} application{apps === 1 ? '' : 's'}
                          </span>
                          <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
                            Joined {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => onPromote(user.id)}
                          className="rounded-xl border border-blue-primary/30 bg-blue-light px-4 py-2 text-sm font-medium text-blue-text transition-colors hover:bg-blue-primary/15"
                        >
                          Promote
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onBan(user.id, user.isBanned)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                          user.isBanned
                            ? 'border-green-200 bg-offered/40 text-green-800 hover:bg-offered dark:border-green-900/40 dark:text-green-300'
                            : 'border-amber-200 bg-interviewing/40 text-amber-900 hover:bg-interviewing/60 dark:border-amber-900/40 dark:text-amber-200'
                        }`}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user.id)}
                        className="rounded-xl border border-red-200 bg-rejected/50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-rejected dark:border-red-900/50 dark:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <JobPagination pagination={pagination} onPageChange={setPage} itemLabel="users" />
        </>
      )}
    </div>
  );
}