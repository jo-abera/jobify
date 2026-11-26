import { JOB_CATEGORIES } from '../constants/jobCategories';

/**
 * Category chips for the job board (Engineering, Sales, …).
 * value: '' = all categories, otherwise exact category name.
 */
export default function JobCategoryFilter({ value = '', onChange }) {
  const allActive = !value;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          allActive
            ? 'bg-blue-light text-blue-text border border-blue-primary/25 shadow-sm'
            : 'bg-bg-card border border-border text-text-secondary hover:border-blue-primary/20 hover:bg-bg-hover'
        }`}
      >
        All categories
      </button>
      {JOB_CATEGORIES.filter((c) => c !== 'Other').map((category) => {
        const isActive = value === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-light text-blue-text border border-blue-primary/25 shadow-sm'
                : 'bg-bg-card border border-border text-text-secondary hover:border-blue-primary/20 hover:bg-bg-hover'
            }`}
          >
            {category}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange('Other')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          value === 'Other'
            ? 'bg-blue-light text-blue-text border border-blue-primary/25 shadow-sm'
            : 'bg-bg-card border border-border text-text-secondary hover:border-blue-primary/20 hover:bg-bg-hover'
        }`}
      >
        Other
      </button>
    </div>
  );
}