import { JOB_CATEGORIES } from '../constants/jobCategories';

function chipClass(isActive) {
  return `shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
    isActive
      ? 'bg-blue-light text-blue-text border border-blue-primary/25 shadow-sm'
      : 'bg-bg-card border border-border text-text-secondary hover:border-blue-primary/20 hover:bg-bg-hover'
  }`;
}

/**
 * Category chips for quick filtering (Engineering, Sales, …).
 * value: '' = all categories, otherwise exact category name.
 */
function chipLabel(name, count, isActive) {
  if (count == null) return name;
  return (
    <>
      {name}{' '}
      <span
        className={`tabular-nums text-xs font-bold ${
          isActive
            ? 'text-blue-text'
            : 'text-text-primary'
        }`}
      >
        ({count})
      </span>
    </>
  );
}

export default function JobCategoryFilter({
  value = '',
  onChange,
  className = '',
  id = 'job-category-filter',
  countsByCategory = null,
  totalCount = null,
  loadingCounts = false,
}) {
  const allActive = !value;
  const mainCategories = JOB_CATEGORIES.filter((c) => c !== 'Other');
  const countFor = (name) =>
    countsByCategory && typeof countsByCategory[name] === 'number'
      ? countsByCategory[name]
      : null;

  return (
    <nav aria-label="Filter by job category" className={className}>
      <div
        id={id}
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] md:flex-wrap md:overflow-visible"
      >
        <button
          type="button"
          onClick={() => onChange('')}
          className={chipClass(allActive)}
          aria-pressed={allActive}
        >
          {loadingCounts && !countsByCategory
            ? 'All'
            : chipLabel('All', totalCount, allActive)}
        </button>
        {mainCategories.map((category) => {
          const isActive = value === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={chipClass(isActive)}
              aria-pressed={isActive}
            >
              {chipLabel(category, countFor(category), isActive)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange('Other')}
          className={chipClass(value === 'Other')}
          aria-pressed={value === 'Other'}
        >
          {chipLabel('Other', countFor('Other'), value === 'Other')}
        </button>
      </div>
    </nav>
  );
}