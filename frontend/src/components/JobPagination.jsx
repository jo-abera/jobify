/**
 * Job listing pagination — bar layout (prev | pages | next).
 */

export function buildPageNumbers(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = [1];
  if (page > 3) pages.push('…');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    pages.push(p);
  }
  if (page < totalPages - 2) pages.push('…');
  pages.push(totalPages);
  return pages;
}

function PageButtons({ pages, page, onPageChange }) {
  return pages.map((p, idx) =>
    p === '…' ? (
      <span key={`ellipsis-${idx}`} className="px-2 text-text-muted select-none">
        …
      </span>
    ) : (
      <button
        key={p}
        type="button"
        onClick={() => onPageChange(p)}
        className={`min-w-[2.5rem] px-3 py-2 text-sm font-medium transition-all ${
          p === page
            ? 'rounded-full bg-blue-light text-blue-text border border-blue-primary/25 shadow-sm'
            : 'rounded-full border border-border text-text-secondary hover:border-blue-primary/20 hover:bg-bg-hover'
        }`}
      >
        {p}
      </button>
    )
  );
}

function NavButton({ disabled, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:border-blue-primary/20 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export default function JobPagination({ pagination, onPageChange, itemLabel = 'jobs' }) {
  const { page, totalPages, total, hasPrev, hasNext } = pagination;
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-8">
      <p className="text-sm text-text-muted text-center">
        Showing page {page} of {totalPages}{' '}
        <span className="text-text-secondary">
          ({total} {itemLabel})
        </span>
      </p>

      <div className="flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <NavButton
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          className="w-full sm:w-auto"
        >
          ← Previous
        </NavButton>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <PageButtons pages={pages} page={page} onPageChange={onPageChange} />
        </div>
        <NavButton disabled={!hasNext} onClick={() => onPageChange(page + 1)} className="w-full sm:w-auto">
          Next →
        </NavButton>
      </div>
    </div>
  );
}