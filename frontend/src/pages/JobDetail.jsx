/**
 * Single job detail page.
 *
 * Loads job by route param :id, optional save-to-tracker, and inline AI resume
 * scoring (upload or paste). External Apply link goes to employer URL.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getJobById } from '../api/jobs.api';
import { saveJob, getSavedJobs } from '../api/tracker.api';
import { scoreResume, scoreResumeFile } from '../api/resume.api';
import { useAuth } from '../context/AuthContext';
import JobDetailResumeMatch from '../components/job/JobDetailResumeMatch';
import { SplitJobDetailLayout } from '../components/job/JobDetailLayouts';
import { recordJobView } from '../utils/recentlyViewedJobs';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inputMode, setInputMode] = useState('upload');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState('');
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    getJobById(id)
      .then((res) => {
        setJob(res.data);
        recordJobView(res.data.id);
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      getSavedJobs()
        .then((res) => {
          const found = res.data.some((s) => s.jobId === id);
          setSaved(found);
        })
        .catch(() => {});
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

  const resumeMatch = user ? (
    <JobDetailResumeMatch
      user={user}
      inputMode={inputMode}
      setInputMode={setInputMode}
      resumeText={resumeText}
      setResumeText={setResumeText}
      resumeFile={resumeFile}
      setResumeFile={setResumeFile}
      scoreResult={scoreResult}
      scoreError={scoreError}
      setScoreError={setScoreError}
      scoring={scoring}
      onScore={handleScore}
      canScore={canScore}
      embedded
    />
  ) : null;

  return (
    <SplitJobDetailLayout
      job={job}
      user={user}
      saved={saved}
      saving={saving}
      onSave={handleSave}
      resumeMatch={resumeMatch}
    />
  );
}