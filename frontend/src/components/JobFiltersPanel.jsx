import { useEffect, useState } from 'react';
import { getJobFilterOptions } from '../api/jobs.api';

const selectClass =
  'w-full min-w-0 rounded-xl border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-blue-primary/40';

const POSTED_LABELS = {
  '': 'Last 7 days (default)',
  1: 'Last 24 hours',
  3: 'Last 3 days',
  7: 'Last 7 days',
  14: 'Last 14 days',
  30: 'Last 30 days',
};

function FilterField({ label, children }) {
  return (
    <label className="block w-full space-y-1.5">
      <span className="text-xs font-semibold text-text-muted">{label}</span>
      {children}
    </label>
  );
}

/**
 * Dropdown filters for jobs list — values controlled by parent via URL search params.
 */
export default function JobFiltersPanel({
  filters,
  onChange,
  onClearAll,
  showClear = false,
}) {
  const [options, setOptions] = useState({
    categories: [],
    workModes: [],
    experienceLevels: [],
    sourceSites: [],
    postedWithinDays: [1, 3, 7, 14, 30],
  });

  useEffect(() => {
    getJobFilterOptions()
      .then((res) => setOptions((prev) => ({ ...prev, ...res.data })))
      .catch(() => {});
  }, []);

  const postedChoices = ['', ...options.postedWithinDays.map(String)];

  return (
    <div className="rounded-card border border-border bg-bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm font-semibold text-text-primary">Filters</p>
        {showClear && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-blue-text hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <FilterField label="Category">
          <select
            className={selectClass}
            value={filters.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
          >
            <option value="">All categories</option>
            {options.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Work mode">
          <select
            className={selectClass}
            value={filters.workMode || ''}
            onChange={(e) => onChange('workMode', e.target.value)}
          >
            <option value="">Any</option>
            {options.workModes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Experience level">
          <select
            className={selectClass}
            value={filters.experienceLevel || ''}
            onChange={(e) => onChange('experienceLevel', e.target.value)}
          >
            <option value="">Any</option>
            {options.experienceLevels
              .filter((e) => e !== 'Not specified')
              .map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
          </select>
        </FilterField>

        <FilterField label="Posted date">
          <select
            className={selectClass}
            value={filters.postedWithin || ''}
            onChange={(e) => onChange('postedWithin', e.target.value)}
          >
            {postedChoices.map((d) => (
              <option key={d || 'default'} value={d}>
                {POSTED_LABELS[d] || `Last ${d} days`}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Source site">
          <select
            className={selectClass}
            value={filters.sourceSite || ''}
            onChange={(e) => onChange('sourceSite', e.target.value)}
          >
            <option value="">All sources</option>
            {options.sourceSites.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FilterField>
      </div>
    </div>
  );
}