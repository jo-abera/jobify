import TrackerJobCard from './TrackerJobCard';

const COLUMNS = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offered', label: 'Offered' },
];

export function TrackerStatsBar({ stats }) {
  const items = [
    { label: 'Total', value: stats.total },
    { label: 'Applied', value: stats.applied },
    { label: 'Interviewing', value: stats.interviewing },
    { label: 'Offered', value: stats.offered },
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

export function KanbanLayout({ getColumnJobs, onStatusChange, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {COLUMNS.map((col) => {
        const jobs = getColumnJobs(col.id);
        return (
          <div
            key={col.id}
            className="flex min-h-[300px] flex-col rounded-2xl border border-border bg-bg-primary p-4"
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