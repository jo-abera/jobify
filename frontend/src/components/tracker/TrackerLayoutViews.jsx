import TrackerJobCard from './TrackerJobCard';
import { TRACKER_STAGES } from '../../constants/trackerStages';

export function TrackerStatsBar({ stats }) {
  const items = [
    { label: 'Total', value: stats.total },
    ...TRACKER_STAGES.filter((s) => s.id !== 'saved').map((stage) => ({
      label: stage.label,
      value: stats[stage.id] ?? 0,
    })),
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-6">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-blue-text">{value}</span>
          <span className="text-sm text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function KanbanLayout({
  getColumnJobs,
  onStatusChange,
  onNotesSave,
  onAppliedAtSave,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {TRACKER_STAGES.map((col) => {
        const jobs = getColumnJobs(col.id);
        const columnClass =
          col.id === 'rejected'
            ? 'border-red-200/80 bg-rejected/20 dark:border-red-900/40'
            : 'border-border bg-bg-primary';

        return (
          <div
            key={col.id}
            className={`flex min-h-[300px] flex-col rounded-2xl border p-4 ${columnClass}`}
          >
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-text-primary">{col.label}</h2>
              <span className="rounded-full bg-blue-light px-2.5 py-0.5 text-xs font-semibold tabular-nums text-blue-text">
                {jobs.length}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {jobs.length === 0 ? (
                <p className="py-10 text-center text-xs leading-relaxed text-text-muted">
                  No jobs in this stage.
                </p>
              ) : (
                jobs.map((saved) => (
                  <TrackerJobCard
                    key={saved.id}
                    saved={saved}
                    onStatusChange={onStatusChange}
                    onNotesSave={onNotesSave}
                    onAppliedAtSave={onAppliedAtSave}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}