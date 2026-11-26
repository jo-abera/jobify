import Skeleton from './Skeleton';

const ROW_STAGGER = 0.08;

export function CompanyCardSkeleton({ waveIndex = 0 }) {
  const base = waveIndex * 0.12;

  return (
    <div
      className="h-full rounded-xl border border-border bg-bg-card p-4"
      aria-hidden
    >
      <Skeleton className="h-4 w-full max-w-[180px]" delay={base} />
      <Skeleton className="mt-3 h-3 w-24" delay={base + ROW_STAGGER} />
      <Skeleton className="mt-4 h-3 w-32" delay={base + ROW_STAGGER * 2} />
    </div>
  );
}

export default function CompanyCardSkeletonGrid({ count = 6, className = '' }) {
  return (
    <ul
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading companies</span>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <CompanyCardSkeleton waveIndex={i} />
        </li>
      ))}
    </ul>
  );
}