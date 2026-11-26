import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import { downloadCurrentResume, openCurrentResume } from '../../api/resume.api';

function ResumeDocIcon({ className = 'h-10 w-10' }) {
  return (
    <svg className={className + ' text-blue-text'} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M14 6a2 2 0 0 1 2-2h14l10 10v26a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M28 4v12h12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M18 26h12M18 32h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function fileTypeLabel(fileName, mimeType) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.txt')) return 'TXT';
  if (mimeType?.includes('pdf')) return 'PDF';
  if (mimeType?.includes('word')) return 'DOCX';
  if (mimeType?.includes('text')) return 'TXT';
  return 'File';
}

/**
 * Shows the user's active resume on file (one per account until replaced).
 */
export default function ProfileCurrentResume() {
  const { user } = useAuth();
  const hasCurrent = Boolean(user?.resumeUrl && user?.resumeFileName);
  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleView = async () => {
    setViewing(true);
    setActionError('');
    try {
      await openCurrentResume();
    } catch (err) {
      setActionError(
        err.code === 'POPUP_BLOCKED'
          ? err.message
          : err.response?.data?.message || err.message || 'Could not open resume.'
      );
    } finally {
      setViewing(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setActionError('');
    try {
      await downloadCurrentResume(user.resumeFileName);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not download resume.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section
      aria-labelledby="current-resume-heading"
      className="rounded-2xl border border-border bg-bg-card p-5 md:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-text">On your account</p>
      <h3 id="current-resume-heading" className="mt-1 text-lg font-semibold text-text-primary">
        Current resume
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        This is the resume used for AI matching and shown on your profile until you replace it.
      </p>

      {hasCurrent ? (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              aria-hidden
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-primary/20 bg-blue-light"
            >
              <ResumeDocIcon className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-semibold text-text-primary">
                  {user.resumeFileName}
                </p>
                <span className="rounded-full bg-bg-secondary px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                  {fileTypeLabel(user.resumeFileName, user.resumeMimeType)}
                </span>
              </div>
              {user.resumeUploadedAt && (
                <p className="mt-1 text-sm text-text-muted">
                  Last updated {formatDate(user.resumeUploadedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleView}
                disabled={viewing || downloading}
                className="rounded-xl border border-blue-primary/30 bg-blue-light px-4 py-2.5 text-sm font-medium text-blue-text transition-colors hover:bg-blue-primary/15 disabled:opacity-50"
              >
                {viewing ? 'Opening…' : 'View file'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={viewing || downloading}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
              >
                {downloading ? 'Downloading…' : 'Download'}
              </button>
            </div>
            {actionError && <p className="text-sm text-red-300">{actionError}</p>}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-bg-primary px-4 py-8 text-center">
          <div className="flex justify-center">
            <ResumeDocIcon />
          </div>
          <p className="mt-3 text-sm font-medium text-text-primary">No current resume</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
            Upload a PDF, DOCX, or TXT below. It becomes your default resume until you upload a new
            one.
          </p>
        </div>
      )}

    </section>
  );
}