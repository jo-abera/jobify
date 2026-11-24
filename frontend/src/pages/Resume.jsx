/**
 * Dedicated resume scoring page.
 */
import { useState, useEffect } from 'react';
import { getSavedJobs } from '../api/tracker.api';
import { scoreResume, scoreResumeFile } from '../api/resume.api';
import ResumeScoreResult from '../components/ResumeScoreResult';
import { useAuth } from '../context/AuthContext';
import SectionHeading from '../components/SectionHeading';
import SplitResumeLayout from '../components/resume/ResumeScorerLayouts';

export default function Resume() {
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
    err.response?.data?.error || 'An error occurred while scoring the resume.';

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
    <div>
      <section className="border-b border-border bg-bg-secondary/40">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-12">
          <SectionHeading
            headingTag="h1"
            className="mb-0"
            overline="AI matching"
            title="Resume scorer"
            description="Compare your resume against a saved job from your tracker. Upload a file or paste text."
          />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <SplitResumeLayout {...fieldProps} onSubmit={handleScore} />

        {result && (
          <ResumeScoreResult result={result} profileSkills={user?.skills} />
        )}
      </div>
    </div>
  );
}