import Skeleton from './Skeleton';

const ROW_STAGGER = 0.07;

export function JobCardSkeleton({ waveIndex = 0 }) {
  const base = waveIndex * 0.12;

  return (
    <div
      className="rounded-card border border-border bg-bg-card p-5"
      aria-hidden
    >
      <div className="flex items-start gap-4">
        <Skeleton
          className="h-12 w-12 shrink-0 rounded-lg"
          delay={base}
        />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-4 w-full max-w-[220px]" delay={base + ROW_STAGGER} />
          <Skeleton className="h-3 w-full max-w-[150px]" delay={base + ROW_STAGGER * 2} />
          <Skeleton className="h-3 w-full max-w-[110px]" delay={base + ROW_STAGGER * 3} />
          <Skeleton className="mt-1 h-6 w-28 rounded-full" delay={base + ROW_STAGGER * 4} />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" delay={base + ROW_STAGGER * 5} />
            <Skeleton className="h-5 w-20 rounded-full" delay={base + ROW_STAGGER * 6} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobCardSkeletonGrid({ count = 6, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading jobs</span>
      {Array.from({ length: count }, (_, i) => (
        <JobCardSkeleton key={i} waveIndex={i} />
      ))}
    </div>
  );
}