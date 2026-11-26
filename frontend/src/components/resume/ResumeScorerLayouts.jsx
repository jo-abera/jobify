import {
  ModeToggle,
  ResumeInputSection,
  JobSelectSection,
  ScoreError,
  ScoreSubmitButton,
} from './ResumeScorerFields';

export default function SplitResumeLayout({ onSubmit, ...fieldProps }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Score against a job
      </p>
      <ModeToggle {...fieldProps} />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-2xl border border-border bg-bg-primary p-5">
          <ResumeInputSection {...fieldProps} />
        </div>
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-bg-card p-5">
          <JobSelectSection {...fieldProps} />
          <div>
            <ScoreError error={fieldProps.error} />
            <ScoreSubmitButton loading={fieldProps.loading} disabled={!fieldProps.canSubmit} />
          </div>
        </div>
      </div>
    </form>
  );
}