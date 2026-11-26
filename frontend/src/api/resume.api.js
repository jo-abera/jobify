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
export async function fetchCurrentResumeFile(disposition = 'inline') {
  const res = await api.get('/api/resume/current/file', {
    params: { disposition },
    responseType: 'blob',
  });
  const blob = res.data;
  if (!(blob instanceof Blob) || blob.size === 0) {
    const err = new Error('Resume file is empty or missing.');
    err.response = { status: 502, data: { message: err.message } };
    throw err;
  }
  if (blob.type?.includes('json')) {
    try {
      const parsed = JSON.parse(await blob.text());
      const err = new Error(parsed?.message || 'Could not load resume file');
      err.response = { status: res.status, data: parsed };
      throw err;
    } catch (e) {
      if (e?.response) throw e;
      throw new Error('Could not load resume file');
    }
  }
  return res;
}

export function fetchResumeVersionFile(versionId, disposition = 'inline') {
  return api.get(`/api/resume/versions/${versionId}/file`, {
    params: { disposition },
    responseType: 'blob',
  });
}

export const listResumeVersions = () => api.get('/api/resume/versions');

export const setResumeVersionCurrent = (versionId) =>
  api.post(`/api/resume/versions/${versionId}/current`);

/** POST alias avoids some clients/proxies dropping Authorization on DELETE. */
export const deleteResumeVersion = (versionId) =>
  api.post(`/api/resume/versions/${versionId}/delete`);

async function openBlobInNewTab(fetchBlob) {
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
    /* ignore */
  }

  try {
    const res = await fetchBlob();
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

function openExternalUrl(url) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

async function downloadBlob(fetchBlob, fileName) {
  const res = await fetchBlob();
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

export async function openCurrentResume() {
  return openBlobInNewTab(() => fetchCurrentResumeFile('inline'));
}

export async function downloadCurrentResume(fileName) {
  return downloadBlob(() => fetchCurrentResumeFile('attachment'), fileName);
}

/**
 * Opens the employer apply URL and downloads the saved resume (same user gesture).
 */
export async function applyWithResume(jobUrl, resumeFileName) {
  if (!jobUrl) {
    throw new Error('This job has no apply link.');
  }
  // Same pattern as a normal link — avoids pop-up blockers that block window.open.
  openExternalUrl(jobUrl);
  await downloadCurrentResume(resumeFileName);
}

export async function openResumeVersion(versionId) {
  return openBlobInNewTab(() => fetchResumeVersionFile(versionId, 'inline'));
}

export async function downloadResumeVersion(versionId, fileName) {
  return downloadBlob(() => fetchResumeVersionFile(versionId, 'attachment'), fileName);
}
