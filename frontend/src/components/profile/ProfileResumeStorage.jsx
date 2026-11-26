import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import { RESUME_FILE_ACCEPT } from '../resume/ResumeScorerFields';
import { uploadCurrentResume, deleteCurrentResume } from '../../api/resume.api';
import { useAuth } from '../../context/AuthContext';
export default function ProfileResumeStorage({ onUpdated }) {
  const { user, login } = useAuth();
  const [pendingFile, setPendingFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasSaved = Boolean(user?.resumeUrl && user?.resumeFileName);

  const syncUser = (updatedUser) => {
    const token = localStorage.getItem('token');
    login(updatedUser, token || undefined);
  };

  const handleSave = async () => {
    if (!pendingFile) {
      setError('Choose a PDF, DOCX, or TXT file first.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await uploadCurrentResume(pendingFile);
      syncUser(res.data.data.user);
      setPendingFile(null);
      setMessage('Current resume updated on your profile.');
      onUpdated?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail;
      setError(msg || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!hasSaved) return;
    setRemoving(true);
    setError('');
    setMessage('');
    try {
      const res = await deleteCurrentResume();
      syncUser(res.data.data.user);
      setPendingFile(null);
      setMessage('Current resume cleared (versions stay in history).');
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove resume.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section
      aria-labelledby="upload-resume-heading"
      className="rounded-2xl border border-border bg-bg-primary p-5 space-y-4"
    >
      <div>
        <h3 id="upload-resume-heading" className="text-sm font-semibold text-text-primary">
          {hasSaved ? 'Replace current resume' : 'Set current resume'}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          {hasSaved
            ? 'Choosing a new file and saving updates the Current resume section above.'
            : 'Your upload becomes the current resume for this account.'}
        </p>
      </div>

      <FileDropZone
        inputId="profile-resume-save-input"
        accept={RESUME_FILE_ACCEPT}
        file={pendingFile}
        chooseLabel={hasSaved ? 'Choose replacement file' : 'Choose resume file'}
        onFileSelect={(file) => {
          setPendingFile(file);
          setError('');
          setMessage('');
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !pendingFile}
          className="btn-brand rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : hasSaved ? 'Replace resume' : 'Save to profile'}
        </button>
        {hasSaved && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-50"
          >
            {removing ? 'Removing…' : 'Remove'}
          </button>
        )}
      </div>

      {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
    </section>
  );
}