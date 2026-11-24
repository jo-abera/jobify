import { Link } from 'react-router-dom';
import JobDetailHeader from './JobDetailHeader';
import JobDescriptionPanel from './JobDescriptionPanel';

function BackLink() {
  return (
    <Link to="/jobs" className="mb-4 inline-block text-sm text-blue-text hover:underline">
      ← Back to jobs
    </Link>
  );
}

export function SplitJobDetailLayout({ job, user, saved, saving, onSave, resumeMatch }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackLink />

      <div className="mb-8 rounded-card border border-border bg-bg-card p-6">
        <JobDetailHeader
          job={job}
          user={user}
          saved={saved}
          saving={saving}
          onSave={onSave}
          compact
        />
      </div>

      {resumeMatch ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-stretch">
          <JobDescriptionPanel job={job} />
          <aside className="flex h-full min-h-0">
            <div className="flex h-full w-full min-h-full flex-col rounded-card border border-border bg-bg-card p-6">
              {resumeMatch}
            </div>
          </aside>
        </div>
      ) : (
        <div className="max-w-3xl">
          <JobDescriptionPanel job={job} />
        </div>
      )}
    </div>
  );
}