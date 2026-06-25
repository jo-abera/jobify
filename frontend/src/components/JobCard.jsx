/**
 * Job listing card for grid views (Home, Jobs).
 *
 * Links to JobDetail; optional Save button calls POST /api/tracker when logged in.
 * Parent passes savedJobIds to show already-saved state across the list.
 */

export default function () {
  return (
    <div>
      <Link
        to={`/jobs/${job.id}`}
        className="block bg-bg-card border border-border rounded-card p-5 hover:bg-bg-hover hover:border-border-hover transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-light flex items-center justify-center text-blue-text font-bold text-lg shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">
              {job.title}
            </h3>
            <p className="text-text-secondary text-sm mt-0.5">{job.company}</p>
            <p className="text-text-muted text-sm mt-1">{job.location}</p>
            {job.salary && (
              <p className="text-blue-text text-sm mt-1">{job.salary}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs px-2 py-0.5 rounded bg-bg-hover text-text-secondary">
                {job.type}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
