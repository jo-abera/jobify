/**
 * Resume scoring API — text paste and file upload (auth required).
 *
 * Both endpoints return the same shape: { score, matchedKeywords, missingKeywords, summary }.
 */

import api from './axios';

/** Score pasted resume text — POST /api/resume/score */
export const scoreResume = (data) => api.post('/api/resume/score', data);

/**
 * Score uploaded resume file — POST /api/resume/score-file (multipart).
 * @param {string} jobId - Target job to compare against
 * @param {File} file - PDF, DOCX, or TXT
 */
export const scoreResumeFile = (jobId, file) => {
  const formData = new FormData();
  formData.append('resumeFile', file);
  formData.append('jobId', jobId);
  return api.post('/api/resume/score-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** Save or replace the user's current resume on their profile. */
export const uploadCurrentResume = (file) => {
  const formData = new FormData();
  formData.append('resumeFile', file);
  return api.post('/api/resume/current', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteCurrentResume = () => api.delete('/api/resume/current');

/** Score the saved profile resume against a job (no re-upload). */
export const scoreStoredResume = (jobId) =>
  api.post('/api/resume/score-stored', { jobId });

/** Fetch current resume bytes (JWT). disposition: inline | attachment */
export function fetchCurrentResumeFile(disposition = 'inline') {
  return api.get('/api/resume/current/file', {
    params: { disposition },
    responseType: 'blob',
  });
}

export async function openCurrentResume() {
  // Open the tab synchronously (user click). Do not pass "noopener" here — it makes
  // window.open return null, so we cannot navigate the new tab after the fetch.
  const popup = window.open('about:blank', '_blank');
  if (!popup) {
    const blocked = new Error(
      'Your browser blocked the new tab. Allow pop-ups for this site and try again.'
    );
    blocked.code = 'POPUP_BLOCKED';
    throw blocked;
  }
  popup.opener = null;
  try {
    popup.document.title = 'Loading resume…';
    popup.document.body.innerHTML =
      '<p style="font-family:system-ui,sans-serif;padding:1.5rem;color:#444">Loading resume…</p>';
  } catch {
    /* cross-origin once navigated — ignore */
  }

  try {
    const res = await fetchCurrentResumeFile('inline');
    const type =
      res.headers['content-type']?.split(';')[0]?.trim() || 'application/pdf';
    const url = URL.createObjectURL(new Blob([res.data], { type }));
    popup.location.replace(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  } catch (err) {
    popup.close();
    throw err;
  }
}

export async function downloadCurrentResume(fileName) {
  const res = await fetchCurrentResumeFile('attachment');
  const type =
    res.headers['content-type']?.split(';')[0]?.trim() || 'application/octet-stream';
  const url = URL.createObjectURL(new Blob([res.data], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName || 'resume';
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
