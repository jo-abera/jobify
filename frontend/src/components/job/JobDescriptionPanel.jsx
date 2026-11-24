import { useMemo } from 'react';
import { formatFactLabel, parseJobDescription } from '../../utils/jobDescription';

export default function JobDescriptionPanel({ job, className = '' }) {
  const { highlightFacts, paragraphs } = useMemo(
    () => parseJobDescription(job.description, job),
    [job]
  );

  return (
    <div
      className={`flex h-full flex-col rounded-card border border-border bg-bg-card p-6 md:p-7 ${className}`}
    >
      <h2 className="text-lg font-semibold text-text-primary">About this role</h2>
      <p className="mt-1 text-sm text-text-muted">
        Details from the original listing — role info above may summarize the same fields.
      </p>

      {highlightFacts.length > 0 && (
        <dl className="mt-5 grid gap-3 rounded-xl border border-border bg-bg-secondary/50 p-4 sm:grid-cols-2">
          {highlightFacts.map(({ label, value }) => (
            <div key={`${label}-${value}`} className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {formatFactLabel(label)}
              </dt>
              <dd className="mt-0.5 text-sm font-medium leading-snug text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 min-h-0 flex-1 border-t border-border pt-6">
        {paragraphs.length > 0 ? (
          <div className="space-y-4">
            {paragraphs.map((para, index) => (
              <p
                key={index}
                className="text-[15px] leading-relaxed text-text-secondary"
              >
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-secondary">
            {job.description}
          </p>
        )}
      </div>
    </div>
  );
}