/** Pulse placeholder block for loading UI. */
export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-bg-secondary ${className}`}
      aria-hidden
    />
  );
}