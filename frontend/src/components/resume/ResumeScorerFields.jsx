import FileDropZone from '../FileDropZone';

export const RESUME_FILE_ACCEPT =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export function ModeToggle({ inputMode, setInputMode, onClearError, hasSavedResume }) {
  const modes = [
    ...(hasSavedResume ? [{ id: 'saved', label: 'Saved resume' }] : []),
    { id: 'upload', label: 'Upload file' },
    { id: 'paste', label: 'Paste text' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {modes.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            setInputMode(id);
            onClearError?.();
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            inputMode === id
              ? 'border border-blue-primary/25 bg-blue-light text-blue-text'
              : 'border border-border text-text-secondary hover:bg-bg-hover'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ResumeInputSection({
  inputMode,
  resume,
  setResume,
  resumeFile,
  onFileChange,
  hasSavedResume,
}) {
  if (inputMode === 'saved') {
    return (
      <div className="rounded-xl border border-border bg-bg-card px-4 py-4 text-sm text-text-secondary">
        <p>
          Uses the resume you saved in the section above. Replace that file there if you want to
          score an updated version.
        </p>
        {!hasSavedResume && (
          <p className="mt-2 text-red-300">No saved resume yet — upload one above.</p>
        )}
      </div>
    );
  }

  if (inputMode === 'upload') {
    return (
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Your resume
        </label>
        <FileDropZone
          inputId="resume-file-input"
          accept={RESUME_FILE_ACCEPT}
          file={resumeFile}
          chooseLabel="Choose a file"
          onFileSelect={(f) =>
            onFileChange({ target: { files: [f] } })
          }
        />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
        Your resume
      </label>
      <textarea
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        rows={10}
        placeholder="Paste your resume text here..."
        className="w-full resize-y rounded-2xl border border-border bg-bg-card px-4 py-3 text-text-primary focus:border-border-hover focus:outline-none focus:ring-0"
      />
    </div>
  );
}

export function jobOptionLabel(saved) {
  const title = (saved.job.title || 'Role').slice(0, 80);
  let company = (saved.job.company || '').trim();
  if (company.length > 48 || /^description:/i.test(company)) {
    company = saved.job.location?.trim() || 'View job details';
  }
  return `${title} · ${company.slice(0, 48)}`;
}

export function JobSelectSection({ savedJobs, jobId, setJobId }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
        Target job
      </label>
      <select
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
        className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary focus:border-border-hover focus:outline-none focus:ring-0"
      >
        {savedJobs.length === 0 ? (
          <option value="">No saved jobs — save roles from the Jobs page first</option>
        ) : (
          savedJobs.map((s) => (
            <option key={s.jobId} value={s.jobId}>
              {jobOptionLabel(s)}
            </option>
          ))
        )}
      </select>
      <p className="mt-2 text-xs text-text-muted">
        The AI compares your resume to this job&apos;s description.
      </p>
    </div>
  );
}

export function ScoreError({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-rejected px-4 py-3 text-sm text-red-300">{error}</div>
  );
}

export function ScoreSubmitButton({ loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="btn-brand w-full rounded-xl px-6 py-3 font-semibold text-white transition-all disabled:opacity-50 sm:w-auto"
    >
      {loading ? 'Scoring…' : 'Score my resume'}
    </button>
  );
}