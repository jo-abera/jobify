import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { TRACKER_STAGES, normalizeTrackerStatus } from '../../constants/trackerStages';

export default function TrackerJobCard({
  saved,
  onStatusChange,
  onDelete,
  compact = false,
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-bg-card shadow-sm transition-colors hover:border-border-hover hover:bg-bg-hover ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <Link to={`/jobs/${saved.job.id}`} className="block">
        <h3 className="font-medium text-text-primary text-sm truncate">{saved.job.title}</h3>
        <p className="text-text-secondary text-xs mt-0.5">{saved.job.company}</p>
        <p className="text-text-muted text-xs mt-1">Saved {formatDate(saved.savedAt)}</p>
      </Link>
      {saved.notes && (
        <p className="text-text-muted text-xs mt-2 italic line-clamp-2">{saved.notes}</p>
      )}
      <select
        value={normalizeTrackerStatus(saved.status)}
        onChange={(e) => onStatusChange(saved.id, e.target.value)}
        className="mt-3 w-full bg-bg-secondary border border-border rounded-lg text-xs text-text-secondary px-2 py-1.5 focus:outline-none focus:ring-0 focus:border-border-hover"
      >
        {TRACKER_STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onDelete(saved.id)}
        className="mt-2 w-full text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}