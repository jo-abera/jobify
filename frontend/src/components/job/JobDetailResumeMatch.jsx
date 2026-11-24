import FileDropZone from '../FileDropZone';
import ResumeScoreResult from '../ResumeScoreResult';

const ACCEPT =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export default function JobDetailResumeMatch({
  user,
  inputMode,
  setInputMode,
  resumeText,
  setResumeText,
  resumeFile,
  setResumeFile,
  scoreResult,
  scoreError,
  setScoreError,
  scoring,
  onScore,
  canScore,
  embedded = false,
}) {
  if (!user) return null;

  const shell = embedded
    ? 'flex h-full min-h-0 flex-col gap-4'
    : 'rounded-card border border-border bg-bg-card p-6';

  return (
    <div className={shell}>
      <div>
        <h2 className="text-lg font-semibold text-text-primary">AI Resume Match</h2>
        <p className="mt-1 text-sm text-text-muted">
          Upload your resume or paste text to see how well you match this role.
        </p>
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-border bg-bg-secondary p-1">
        <button
          type="button"
          onClick={() => {
            setInputMode('upload');
            setScoreError('');
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            inputMode === 'upload'
              ? 'border border-blue-primary/25 bg-blue-light text-blue-text'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode('paste');
            setScoreError('');
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            inputMode === 'paste'
              ? 'border border-blue-primary/25 bg-blue-light text-blue-text'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Paste text
        </button>
      </div>

      {inputMode === 'upload' ? (
        <div className={embedded ? 'flex min-h-0 flex-1 flex-col' : undefined}>
          <FileDropZone
            accept={ACCEPT}
            file={resumeFile}
            compact={embedded}
            className={embedded ? 'flex min-h-0 flex-1 flex-col justify-center' : ''}
            chooseLabel="Choose a file"
            onFileSelect={(file) => {
              setResumeFile(file);
              setScoreError('');
            }}
          />
        </div>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={embedded ? 8 : 6}
          placeholder="Paste your resume text here..."
          className={`w-full resize-y rounded-lg border border-border bg-bg-secondary px-4 py-3 text-text-primary focus:border-border-hover focus:outline-none focus:ring-0 ${
            embedded ? 'min-h-[10rem] flex-1' : 'mb-1'
          }`}
        />
      )}

      <button
        type="button"
        onClick={onScore}
        disabled={scoring || !canScore}
        className="btn-brand rounded-xl px-6 py-2.5 font-semibold text-white transition-colors disabled:opacity-50"
      >
        {scoring ? 'Scoring...' : 'Score my resume'}
      </button>

      {scoreError && <p className="text-sm text-red-300">{scoreError}</p>}

      {scoreResult && (
        <ResumeScoreResult result={scoreResult} compact profileSkills={user?.skills} />
      )}
    </div>
  );
}