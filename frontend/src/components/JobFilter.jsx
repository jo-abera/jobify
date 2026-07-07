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
  { label: 'Entry Level', value: 'Entry Level', type: true }
]

export default function JobFilter({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const key = f.location ? `loc:${f.value}` : f.type ? `type:${f.value}` : 'all'
        const isActive = activeFilter === key
        return (
          <button
            key={key}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-primary text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:bg-bg-hover hover:border-border-hover'
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
