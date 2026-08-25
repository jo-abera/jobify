/**
 * Dedicated resume scoring page.
 *
 * User selects a saved job (tracker), then scores via file upload (PDF/DOCX/TXT)
 * or pasted text. Calls POST /api/resume/score-file or /api/resume/score.
 */

import { useState, useEffect } from 'react';
import { getSavedJobs } from '../api/tracker.api';
import { scoreResume, scoreResumeFile } from '../api/resume.api';
import ResumeScoreResult from '../components/ResumeScoreResult';
import { useAuth } from '../context/AuthContext';

const ACCEPT =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export default function Resume() {
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'paste'
  const [resume, setResume] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobId, setJobId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSavedJobs()
      .then((res) => {
        setSavedJobs(res.data);
        if (res.data.length > 0) setJobId(res.data[0].jobId);
      })
      .catch(() => {});
  }, []);

  const getErrorMessage = (err) => {
    return (
      err.response?.data?.error || 'An error occurred while scoring the resume.'
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
    setError('');
  };

  const handleScore = async (e) => {
    e.preventDefault();
    if (!jobId) {
      setError('Please select a saved job.');
      return;
    }

    if (inputMode === 'upload' && !resumeFile) {
      setError('Please upload a resume file (PDF/DOCX/TXT).');
      return;
    }
    if (inputMode === 'paste' && !resume.trim()) {
      setError('Please paste your resume text.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res =
        inputMode === 'upload'
          ? await scoreResumeFile(jobId, resumeFile)
          : await scoreResume({ jobId, resumeText: resume });
      setResult(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    savedJobs.length > 0 &&
      jobId &&
      (inputMode === 'upload' ? resumeFile : resume.trim());
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        Resume Scorer
      </h1>
      <p className="text-text-secondary mb-6">
        Compare your resume against a saved job using AI. Upload a file or paste
        text.
      </p>

      <form onSubmit={handleScore} className="space-y-4">
        <div className="flex gap-2 p-1 bg-bg-secondary border border-border rounded-lg w-fit">
          <button
            type="button"
            onClick={() => {
              setInputMode('upload');
              setError('');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${inputMode === 'upload' ? 'bg-blue-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Upload file
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode('paste');
              setError('');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${inputMode === 'paste' ? 'bg-blue-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Paste text
          </button>
        </div>

        {inputMode === 'upload' ? (
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Your resume file
            </label>
            <div
              className="border border-dashed border-border rounded-lg p-6 bg-bg-card text-center
                hover:border-blue-primary/50 transition-colors"
            >
              <input
                type="file"
                accept={ACCEPT}
                onChange={handleFileChange}
                className="hidden"
                id="resume-file-input"
              />
              <label
                htmlFor="resume-file-input"
                className="cursor-pointer text-blue-text text-sm font-medium hover:underline"
              >
                Choose a file
              </label>
              <p className="text-text-muted text-xs mt-2">
                PDF, DOCX, or TXT — max 5 MB
              </p>
              {resumeFile && (
                <p className="text-text-primary text-sm mt-3">
                  Selected:{' '}
                  <span className="font-medium">{resumeFile.name}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Your resume
            </label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={10}
              placeholder="Paste your resume text here..."
              className="w-full bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue-primary resize-y"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Select a saved job
          </label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-blue-primary"
          >
            {savedJobs.length === 0 ? (
              <option value="">
                No saved jobs — save jobs from the Jobs page first
              </option>
            ) : (
              savedJobs.map((s) => (
                <option key={s.jobId} value={s.jobId}>
                  {s.job.title} at {s.job.company}
                </option>
              ))
            )}
          </select>
          <p className="text-text-muted text-xs mt-1">
            The AI compares your resume to this job&apos;s description.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rejected text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="bg-blue-primary hover:bg-blue-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Scoring...' : 'Score my resume'}
        </button>
      </form>

      {result && (
        <ResumeScoreResult result={result} profileSkills={user?.skills} />
      )}
    </div>
  );
}
