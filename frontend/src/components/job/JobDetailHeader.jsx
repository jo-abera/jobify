import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applyWithResume } from '../../api/resume.api';
import {
  companyPathForJob,
  jobHasCompanyPage,
  resolveCompanyDisplayName,
} from '../../utils/companySlug';
import { isResumeSectionComplete } from '../../utils/profileCompletion';

export default function JobDetailHeader({
  job,
  user,
  saved,
  saving,
  onSave,
  compact = false,
}) {
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const hasResume = Boolean(user && isResumeSectionComplete(user));
  const initial = (job.company?.charAt(0) || '?').toUpperCase();

  const handleApplyWithResume = async () => {
    setApplyError('');
    setApplying(true);
    try {
      await applyWithResume(job.url, user.resumeFileName);
    } catch (err) {
      setApplyError(err.message || 'Could not download your resume. Try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className={compact ? '' : 'bg-bg-card border border-border rounded-card p-6'}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bg-secondary text-2xl font-bold text-blue-text">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h1
            className={`font-bold text-text-primary ${compact ? 'text-xl' : 'text-2xl'}`}
          >
            {job.title}
          </h1>
          <p className="mt-1 text-text-secondary">
            {job.company ? (
              <>
                {jobHasCompanyPage(job) ? (
                  <Link
                    to={companyPathForJob(job)}
                    className="font-medium text-blue-text hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {resolveCompanyDisplayName(job)}
                  </Link>
                ) : (
                  <span className="font-medium text-text-secondary">
                    {resolveCompanyDisplayName(job)}
                  </span>
                )}
                {' · '}
              </>
            ) : null}
            {job.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded bg-bg-secondary px-2.5 py-1 text-xs text-text-secondary">
              {job.type}
            </span>
            {job.salary && (
              <span className="rounded bg-offered px-2.5 py-1 text-xs text-green-300">
                {job.salary}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`flex flex-wrap gap-3 ${compact ? 'mt-4' : 'mt-6'}`}>
        {hasResume ? (
          <button
            type="button"
            onClick={handleApplyWithResume}
            disabled={applying}
            className="btn-brand rounded-xl px-5 py-2.5 font-semibold text-white transition-colors disabled:opacity-60"
          >
            {applying ? 'Preparing…' : 'Apply with Resume'}
          </button>
        ) : null}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-xl px-5 py-2.5 font-semibold transition-colors ${
            hasResume
              ? 'border border-border bg-bg-card text-text-primary hover:bg-bg-hover'
              : 'btn-brand text-white'
          }`}
        >
          Apply on company site
        </a>
        {user && (
          <button
            type="button"
            onClick={onSave}
            disabled={saved || saving}
            className={`rounded-xl border px-5 py-2.5 font-medium transition-colors ${
              saved
                ? 'cursor-default border-border text-text-muted'
                : 'border-blue-primary text-blue-text hover:bg-blue-primary/10'
            }`}
          >
            {saved ? 'Saved to Tracker' : saving ? 'Saving...' : 'Save to Tracker'}
          </button>
        )}
      </div>
      {applyError ? (
        <p className="mt-2 text-xs text-red-400">{applyError}</p>
      ) : null}
      <p className="mt-2 text-xs text-text-muted">
        {hasResume
          ? 'Apply with Resume opens the listing and downloads your saved file so you can attach it on the employer site.'
          : "Opens the employer's careers page in a new tab — applications are submitted on their website."}
      </p>
    </div>
  );
}