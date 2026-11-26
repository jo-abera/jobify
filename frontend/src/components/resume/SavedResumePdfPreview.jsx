import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentResumeFile, openCurrentResume } from '../../api/resume.api';
import { isResumePdf } from '../../utils/resumePreview';
import ResumePdfPreview from './ResumePdfPreview';

/**
 * Inline preview of the user's saved current resume (profile + application pages).
 */
export default function SavedResumePdfPreview({
  title = 'Your current resume',
  compact = false,
  className = '',
  showEmptyHint = true,
}) {
  const { user } = useAuth();
  const hasSaved = Boolean(user?.resumeUrl && user?.resumeFileName);
  const hasPdf = hasSaved && isResumePdf(user.resumeFileName, user.resumeMimeType);

  const loadBlob = useCallback(() => fetchCurrentResumeFile('inline'), []);

  if (!hasSaved) {
    if (!showEmptyHint) return null;
    return (
      <div
        className={`rounded-xl border border-dashed border-border bg-bg-primary px-4 py-5 text-sm text-text-muted ${className}`}
      >
        No resume on file.{' '}
        <Link to="/profile?tab=resume" className="font-medium text-blue-text hover:underline">
          Add one in Profile
        </Link>
      </div>
    );
  }

  if (!hasPdf) {
    if (!showEmptyHint) return null;
    return (
      <div
        className={`rounded-xl border border-border bg-bg-primary px-4 py-5 text-sm text-text-muted ${className}`}
      >
        <p className="font-medium text-text-primary">{user.resumeFileName}</p>
        <p className="mt-1">
          PDF preview is not available for this format.{' '}
          <Link to="/profile?tab=resume" className="text-blue-text hover:underline">
            Open in Profile
          </Link>
        </p>
      </div>
    );
  }

  return (
    <ResumePdfPreview
      title={title}
      loadBlob={loadBlob}
      fileNameHint={user.resumeFileName}
      mimeHint={user.resumeMimeType}
      refreshKey={`${user.resumeUrl}|${user.resumeUploadedAt}`}
      compact={compact}
      className={className}
      allowExpand
      onOpenInNewTab={openCurrentResume}
    />
  );
}