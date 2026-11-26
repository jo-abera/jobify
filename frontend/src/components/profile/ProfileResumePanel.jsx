/**
 * Resume scoring inside Profile — same flow as the former /resume page (ephemeral upload/paste).
 * Persistent resume storage and preview come in later tasks.
 */
import { useState, useEffect } from 'react';
import { getSavedJobs } from '../../api/tracker.api';
import { scoreResume, scoreResumeFile } from '../../api/resume.api';
import ResumeScoreResult from '../ResumeScoreResult';
import { useAuth } from '../../context/AuthContext';
import SplitResumeLayout from '../resume/ResumeScorerLayouts';

export default function ProfileResumePanel() {
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState('upload');
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

  const getErrorMessage = (err) =>
    err.response?.data?.message ||
    err.response?.data?.error ||
    'An error occurred while scoring the resume.';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setResumeFile(file || null);
    setError('');
  };

  const canSubmit =
    savedJobs.length > 0 &&
    jobId &&
    (inputMode === 'upload' ? !!resumeFile : !!resume.trim());

  const handleScore = async (e) => {
    e.preventDefault();
    if (!jobId) {
      setError('Please select a saved job from your tracker.');
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
          : await scoreResume({ jobId, resume: resume.trim() });
      setResult(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = {
    inputMode,
    setInputMode,
    resume,
    setResume,
    resumeFile,
    onFileChange: handleFileChange,
    savedJobs,
    jobId,
    setJobId,
    error,
    loading,
    canSubmit,
    onClearError: () => setError(''),
  };

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-text-primary">Resume &amp; AI matching</h2>
        <p className="mt-1 text-sm text-text-muted">
          Compare a resume against a job in your tracker. Upload a file or paste text — your career
          profile skills are used when highlighting matches.
        </p>
      </header>

      <SplitResumeLayout {...fieldProps} onSubmit={handleScore} />

      {result && <ResumeScoreResult result={result} profileSkills={user?.skills} />}
    </main>
  );
}