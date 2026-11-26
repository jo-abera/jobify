import TrackerJobCard from './TrackerJobCard';
import { TRACKER_STAGES } from '../../constants/trackerStages';

export function TrackerStatsBar({ stats }) {
  const items = [
    { label: 'Total saved', value: stats.total, dotClass: 'bg-blue-primary' },
    ...TRACKER_STAGES.filter((s) => s.id !== 'saved').map((stage) => ({
      label: stage.label,
      value: stats[stage.id] ?? 0,
      dotClass: stage.dotClass,
    })),
  ];

  return (
    <div className="mb-6 flex flex-wrap justify-center gap-3">
      {items.map(({ label, value, dotClass }) => (
        <div
          key={label}
          className="w-[calc(50%-0.375rem)] rounded-xl border border-border bg-bg-card px-4 py-3 shadow-sm sm:w-40 md:w-44"
        >
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
            <span className="text-xs font-medium text-text-secondary">{label}</span>
          </div>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
        </div>
      ))}
    </div>
  );
}

const COLUMN_SURFACE = {
  saved: 'border-slate-300/80 bg-slate-500/5 dark:border-slate-600/60',
  applied: 'border-blue-200/60 bg-blue-light/30 dark:border-blue-900/40',
  interview: 'border-violet-200/60 bg-violet-500/5 dark:border-violet-900/40',
  offer: 'border-emerald-200/60 bg-emerald-500/5 dark:border-emerald-900/40',
  rejected: 'border-red-200/80 bg-rejected/20 dark:border-red-900/40',
};

export function KanbanLayout({
  getColumnJobs,
  onStatusChange,
  onNotesSave,
  onAppliedAtSave,
  onFollowUpAtSave,
  onDelete,
}) {
  return (
    <div
      className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-3"
      role="region"
      aria-label="Application stages"
    >
          {TRACKER_STAGES.map((col) => {
            const jobs = getColumnJobs(col.id);
            const columnClass = COLUMN_SURFACE[col.id] || COLUMN_SURFACE.saved;

            return (
              <div
                key={col.id}
                className={`flex min-h-[min(70vh,640px)] min-w-0 flex-col rounded-2xl border p-2.5 sm:p-3 xl:p-3 ${columnClass}`}
              >
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${col.dotClass}`}
                      aria-hidden
                    />
                    <h2 className="truncate text-sm font-semibold text-text-primary">
                      {col.label}
                    </h2>
                  </div>
                  <span className="rounded-full bg-bg-card px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-secondary ring-1 ring-border">
                    {jobs.length}
                  </span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {jobs.length === 0 ? (
                    <p className="py-12 text-center text-xs leading-relaxed text-text-muted">
                      No jobs here yet.
                    </p>
                  ) : (
                    jobs.map((saved) => (
                      <TrackerJobCard
                        key={saved.id}
                        saved={saved}
                        onStatusChange={onStatusChange}
                        onNotesSave={onNotesSave}
                        onAppliedAtSave={onAppliedAtSave}
                        onFollowUpAtSave={onFollowUpAtSave}
                        onDelete={onDelete}
                        compact
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