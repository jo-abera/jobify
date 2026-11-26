import Skeleton from './Skeleton';

export function CompanyCardSkeleton() {
  return (
    <div
      className="h-full rounded-xl border border-border bg-bg-card p-4"
      aria-hidden
    >
      <Skeleton className="h-4 w-full max-w-[180px]" />
      <Skeleton className="mt-3 h-3 w-24" />
      <Skeleton className="mt-4 h-3 w-32" />
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
          <CompanyCardSkeleton />
        </li>
      ))}
    </ul>
  );
}