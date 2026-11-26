import Skeleton from './Skeleton';

export function JobCardSkeleton() {
  return (
    <div
      className="rounded-card border border-border bg-bg-card p-5"
      aria-hidden
    >
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <Skeleton className="h-4 w-full max-w-[220px]" />
          <Skeleton className="h-3 w-full max-w-[150px]" />
          <Skeleton className="h-3 w-full max-w-[110px]" />
          <Skeleton className="mt-1 h-6 w-28 rounded-full" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
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
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}