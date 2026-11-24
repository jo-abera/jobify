export default function JobDetailHeader({
  job,
  user,
  saved,
  saving,
  onSave,
  compact = false,
}) {
  const initial = (job.company?.charAt(0) || '?').toUpperCase();

  return (
    <div className={compact ? '' : 'bg-bg-card border border-border rounded-card p-6'}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bg-secondary text-2xl font-bold text-blue-text">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h1
            className={`font-bold text-text-primary ${compact ? 'text-xl' : 'text-2xl'}`}
          >
            {job.title}
          </h1>
          <p className="mt-1 text-text-secondary">
            {job.company} · {job.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded bg-bg-secondary px-2.5 py-1 text-xs text-text-secondary">
              {job.type}
            </span>
            {job.salary && (
              <span className="rounded bg-offered px-2.5 py-1 text-xs text-green-300">
                {job.salary}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`flex flex-wrap gap-3 ${compact ? 'mt-4' : 'mt-6'}`}>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-brand rounded-xl px-5 py-2.5 font-semibold text-white transition-colors"
        >
          Apply on company site
        </a>
        {user && (
          <button
            type="button"
            onClick={onSave}
            disabled={saved || saving}
            className={`rounded-xl border px-5 py-2.5 font-medium transition-colors ${
              saved
                ? 'cursor-default border-border text-text-muted'
                : 'border-blue-primary text-blue-text hover:bg-blue-primary/10'
            }`}
          >
            {saved ? 'Saved to Tracker' : saving ? 'Saving...' : 'Save to Tracker'}
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Opens the employer&apos;s careers page in a new tab — applications are submitted on
        their website.
      </p>
    </div>
  );
}