/** Shimmer placeholder block for loading UI. */
export default function Skeleton({ className = '', delay = 0, style, ...props }) {
  return (
    <div
      className={`skeleton-wave rounded-md ${className}`}
      style={{ animationDelay: delay ? `${delay}s` : undefined, ...style }}
      aria-hidden
      {...props}
    />
  );
}