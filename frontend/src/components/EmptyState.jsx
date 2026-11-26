/**
 * Shared empty-state panel with optional actions.
 */
export default function EmptyState({
  title,
  description,
  icon = '∅',
  compact = false,
  className = '',
  children,
}) {
  const shell = compact
    ? 'rounded-xl border border-dashed border-border/80 bg-bg-secondary/40 px-3 py-8'
    : 'rounded-2xl border border-dashed border-border bg-bg-card/70 px-6 py-10';

  const iconBox = compact
    ? 'mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-bg-card text-base text-text-muted'
    : 'mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-xl text-text-muted';

  const titleClass = compact
    ? 'text-sm font-semibold text-text-primary'
    : 'text-lg font-semibold text-text-primary';

  return (
    <div
      className={`${shell} text-center ${className}`}
      role="status"
    >
      <div className={`mx-auto ${iconBox}`} aria-hidden>
        {icon}
      </div>
      <h3 className={titleClass}>{title}</h3>
      {description ? (
        <p
          className={`mx-auto max-w-md text-text-secondary ${
            compact ? 'mt-1 text-xs leading-relaxed' : 'mt-2 text-sm'
          }`}
        >
          {description}
        </p>
      ) : null}
      {children ? (
        <div
          className={`flex flex-wrap items-center justify-center gap-2 ${
            compact ? 'mt-3' : 'mt-5'
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}