/**
 * Single job detail page.
 *
 * Loads job by route param :id, optional save-to-tracker, and inline AI resume
 * scoring (upload or paste). External Apply link goes to employer URL.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../api/jobs.api';
import { saveJob, getSavedJobs } from '../api/tracker.api';
import { scoreResume, scoreResumeFile } from '../api/resume.api';
import { useAuth } from '../context/AuthContext';
import ResumeScoreResult from '../components/ResumeScoreResult';

const ACCEPT =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'paste'
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState('');
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    getJobById(id)
      .then((res) => setJob(res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      getSavedJobs().then(
        ((res) => {
          const found = res.data.some((s) => s.jobId === id);
          setSaved(found);
        }).catch(() => {})
      );
    }
  }, [user, id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveJob(id);
      setSaved(true);
    } catch (err) {
      if (err.response?.status === 400) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleScore = async () => {
    if (inputMode === 'upload' && !resumeFile) {
      setScoreError('Please select a file to upload.');
      return;
    }
    if (inputMode === 'paste' && !resumeText.trim()) {
      setScoreError('Please paste your resume text.');
      return;
    }
    setScoring(true);
    setScoreResult(null);
    setScoreError('');

    try {
      const res =
        inputMode === 'upload'
          ? await scoreResumeFile(id, resumeFile)
          : await scoreResume({ resume: resumeText, jobId: id });
      setScoreResult(res.data);
    } catch (err) {
      setScoreError(
        err.response?.data?.message ||
          'Failed to score resume. Check your GROQ_API_KEY.'
      );
    }
  };

  const canScore = inputMode === 'upload' ? !!resumeFile : !!resumeText.trim();

  if (loading)
    return (
      <p className="text-text-muted text-center py-12">
        Loading job details...
      </p>
    );
  if (!job)
    return <p className="text-text-muted text-center py-12">Job not found.</p>;

  const initial = job.company.charAt(0).toUpperCase() || '?'; // Gets first letter of company name, uses || to avoid crashes if company is missing

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/jobs"
        className="text-blue-text text-sm hover:underline mb-4 inline-block"
      >
        ← Back to jobs
      </Link>

      <div className="bg-bg-card border border-border rounded-card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-bg-secondary flex items-center justify-center text-2xl font-bold text-blue-text shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary">
              {job.title}
            </h1>
            <p className="text-text-secondary mt-1">
              {job.company} · {job.location}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-1 rounded bg-bg-secondary text-text-secondary text-xs">
                {job.type}
              </span>
              {job.salary && (
                <span className="px-2.5 py-1 rounded bg-offered text-green-300 text-xs">
                  {job.salary}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-primary hover:bg-blue-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Apply on company site
          </a>
          {user && (
            <button
              onClick={handleSave}
              disabled={saved || saving}
              className={`px-5 py-2.5 rounded-lg font-medium border transition-colors
                ${
                  saved
                    ? 'border-border text-text-muted cursor-default'
                    : 'border-blue-primary text-blue-text hover:bg-blue-primary/10'
                }`}
            >
              {saved
                ? 'Saved to Tracker'
                : saving
                  ? 'Saving...'
                  : 'Save to Tracker'}
            </button>
          )}
        </div>
        <p className="text-text-muted text-xs mt-2">
          Opens the employer&apos;s careers page in a new tab — applications are
          submitted on their website.
        </p>
      </div>

      <div className="bg-bg-card border border-border rounded-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Description
        </h2>
        <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
          {job.description}
        </p>
      </div>

      {user && (
        <div className="bg-bg-card border border-border rounded-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            AI Resume Match
          </h2>
          <p className="text-text-muted text-sm mb-3">
            Upload your resume or paste text to see how well you match this
            role.
          </p>

          <div className="flex gap-2 p-1 bg-bg-secondary border border-border rounded-lg w-fit mb-4">
            <button
              type="button"
              onClick={() => {
                setInputMode('upload');
                setScoreError('');
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${inputMode === 'upload' ? 'bg-blue-primary text-white' : 'text-text-secondary'}`}
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('paste');
                setScoreError('');
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${inputMode === 'paste' ? 'bg-blue-primary text-white' : 'text-text-secondary'}`}
            >
              Paste text
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div className="border border-dashed border-border rounded-lg p-4 bg-bg-secondary mb-3">
              <input
                type="file"
                accept={ACCEPT}
                onChange={(e) => {
                  setResumeFile(e.target.files?.[0] || null);
                  setScoreError('');
                }}
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-primary file:text-white file:cursor-pointer"
              />
              <p className="text-text-muted text-xs mt-2">
                PDF, DOCX, or TXT — max 5 MB
              </p>
            </div>
          ) : (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={6}
              placeholder="Paste your resume text here..."
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-blue-primary resize-y mb-3"
            />
          )}

          <button
            type="button"
            onClick={handleScore}
            disabled={scoring || !canScore}
            className="bg-blue-primary hover:bg-blue-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {scoring ? 'Scoring...' : 'Score my resume'}
          </button>

          {scoreError && (
            <p className="mt-4 text-red-300 text-sm">{scoreError}</p>
          )}

          {scoreResult && (
            <ResumeScoreResult
              result={scoreResult}
              compact
              profileSkills={user?.skills}
            />
          )}
        </div>
      )}
    </div>
  );
}
