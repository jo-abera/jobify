import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JobPagination from '../JobPagination';
import { formatDate } from '../../utils/formatDate';
import { normalizeJobDescriptionText } from '../../utils/jobDescription';

const PAGE_SIZE = 15;

function jobExcerpt(description, maxLen = 160) {
  if (!description) return '';
  const normalized = normalizeJobDescriptionText(description);
  const line =
    normalized
      .split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l && !/^[A-Za-z /]+:\s/.test(l) && l.length > 20) ||
    normalized.replace(/\s+/g, ' ').trim();
  const plain = line.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen)}…`;
}

function formatSource(source) {
  if (!source) return 'Unknown';
  const s = String(source);
  if (s.includes('t.me/')) {
    const match = s.match(/t\.me\/([^/?#]+)/i);
    return match ? `@${match[1]}` : 'Telegram';
  }
  try {
    return new URL(s).hostname.replace(/^www\./, '');
  } catch {
    return s.length > 36 ? `${s.slice(0, 36)}…` : s;
  }
}

function sourceHref(source) {
  if (!source) return null;
  const s = String(source);
  if (s.startsWith('http')) return s;
  return null;
}

export default function AdminJobsTab({ jobs, loading, onDelete }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = jobs;
    if (q) {
      list = jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === 'newest') {
      sorted.sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => new Date(a.postedAt || 0) - new Date(b.postedAt || 0));
    } else if (sort === 'saved') {
      sorted.sort((a, b) => (b._count?.savedBy ?? 0) - (a._count?.savedBy ?? 0));
    } else if (sort === 'title') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return sorted;
  }, [jobs, query, sort]);

  const totalSaves = useMemo(
    () => jobs.reduce((sum, j) => sum + (j._count?.savedBy ?? 0), 0),
    [jobs]
  );

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageJobs = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pagination = {
    page: safePage,
    totalPages,
    total,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };

  if (loading) {
    return <p className="text-text-secondary">Loading jobs…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-text-primary">{filtered.length}</span>
            {query ? ' matching' : ''} jobs ·{' '}
            <span className="font-semibold text-text-primary">{totalSaves}</span> total saves
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, company, location…"
            className="w-full rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-border-hover focus:outline-none focus:ring-0 sm:w-64"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-border-hover focus:outline-none focus:ring-0"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="saved">Most saved</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card px-6 py-12 text-center">
          <p className="text-text-secondary">
            {jobs.length === 0 ? 'No jobs in the database.' : 'No jobs match your search.'}
          </p>
        </div>
      ) : (
        <>
        <ul className="space-y-4">
          {pageJobs.map((job) => {
            const initial = (job.company?.charAt(0) || '?').toUpperCase();
            const saves = job._count?.savedBy ?? 0;
            const excerpt = jobExcerpt(job.description);
            const src = formatSource(job.source);
            const href = sourceHref(job.source);

            return (
              <li
                key={job.id}
                className="rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-border-hover md:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-light text-lg font-bold text-blue-text">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-text-primary">{job.title}</h3>
                        {saves > 0 && (
                          <span className="rounded-full bg-blue-light px-2 py-0.5 text-xs font-medium text-blue-text">
                            {saves} saved
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-text-secondary">
                        {job.company} · {job.location}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.type && (
                          <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-xs text-text-secondary">
                            {job.type}
                          </span>
                        )}
                        {job.salary && (
                          <span className="rounded-md bg-offered/40 px-2 py-0.5 text-xs text-green-700 dark:text-green-300">
                            {job.salary}
                          </span>
                        )}
                        {job.postedAt && (
                          <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-xs text-text-muted">
                            Posted {formatDate(job.postedAt)}
                          </span>
                        )}
                      </div>
                      {excerpt && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-muted">
                          {excerpt}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-text-muted">
                        Source:{' '}
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-text hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {src}
                          </a>
                        ) : (
                          src
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="rounded-xl border border-border bg-bg-secondary px-4 py-2 text-center text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
                    >
                      View listing
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(job.id)}
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
        <JobPagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}