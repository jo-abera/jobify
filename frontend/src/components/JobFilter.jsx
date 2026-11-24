/**
 * Job list filter chips (All, Remote, Full-time, etc.).
 *
 * Emits filter keys consumed by Jobs.jsx (e.g. type:Full-time, loc:remote)
 * which map to query params on GET /api/jobs.
 */

const filters = [
  { label: 'All', value: '' },
  { label: 'Remote', value: 'remote', location: true },
  { label: 'Full-time', value: 'Full-time', type: true },
  { label: 'Internship', value: 'Internship', type: true },
  { label: 'Entry Level', value: 'Entry Level', type: true },
];

export default function JobFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const key = f.location ? `loc:${f.value}` : f.type ? `type:${f.value}` : 'all';
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-light text-blue-text border border-blue-primary/25 shadow-sm'
                : 'bg-bg-card border border-border text-text-secondary hover:border-blue-primary/20 hover:bg-bg-hover'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}