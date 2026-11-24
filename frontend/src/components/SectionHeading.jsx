import { Link } from 'react-router-dom';

/**
 * Section title block with optional CTA (e.g. Latest jobs on Home).
 */
export default function SectionHeading({
  overline,
  title,
  description,
  to,
  linkLabel,
  trailing,
  headingTag: Heading = 'h2',
  className = 'mb-10',
}) {
  return (
    <header className={`flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="max-w-xl">
        {overline && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-text mb-2">{overline}</p>
        )}
        <Heading className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
          {title}
        </Heading>
        {description && (
          <p className="mt-3 text-text-secondary text-base leading-relaxed">{description}</p>
        )}
      </div>
      {trailing}
      {to && linkLabel && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-bg-card px-5 py-2.5 text-sm font-semibold text-blue-text transition-colors hover:border-blue-primary/40 hover:bg-bg-hover"
        >
          {linkLabel}
        </Link>
      )}
    </header>
  );
}