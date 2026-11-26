/**
 * Quick employment-type chips (Full-time, Internship, …) synced to ?type= in the URL.
 */

const typeFilters = [
  { label: 'All types', value: '' },
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
];

export default function JobFilter({ activeType = '', onTypeChange, vertical = false }) {
  return (
    <div
      className={
        vertical ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'
      }
    >
      {typeFilters.map((f) => {
        const isActive = activeType === f.value;
        return (
          <button
            key={f.label}
            type="button"
            onClick={() => onTypeChange(f.value)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              vertical ? 'w-full rounded-xl text-left' : 'rounded-full'
            } ${
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