import { computeProfileCompletion } from '../../utils/profileCompletion';

function CheckIcon({ done }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        done
          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
          : 'border border-border bg-bg-secondary text-text-muted'
      }`}
      aria-hidden
    >
      {done ? '✓' : ''}
    </span>
  );
}

export default function ProfileCompletionIndicator({ user, onGoToSection }) {
  const { percent, completedCount, total, sections } = computeProfileCompletion(user);

  return (
    <section
      className="mb-8 rounded-2xl border border-border bg-bg-card p-5 shadow-sm"
      aria-label="Profile completion"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-text-muted">
            Profile strength
          </p>
          <p className="mt-1 text-lg font-semibold text-text-primary tabular-nums">
            {completedCount} of {total} complete
          </p>
        </div>
        <p className="text-2xl font-bold tabular-nums text-blue-text">{percent}%</p>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-bg-secondary"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-blue-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => onGoToSection?.(section.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-bg-hover"
            >
              <CheckIcon done={section.complete} />
              <div className="min-w-0 flex-1">
                <span
                  className={`text-sm font-medium ${
                    section.complete ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {section.label}
                </span>
                {!section.complete && (
                  <p className="mt-0.5 text-xs text-text-muted">{section.hint}</p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}