/**
 * Resume scoring API — text paste and file upload (auth required).
 *
 * Both endpoints return the same shape: { score, matchedKeywords, missingKeywords, summary }.
 */

import api from './axios'

/** Score pasted resume text — POST /api/resume/score */
export const scoreResume = (data) => api.post('/api/resume/score', data)

/**
 * Score uploaded resume file — POST /api/resume/score-file (multipart).
 * @param {string} jobId - Target job to compare against
 * @param {File} file - PDF, DOCX, or TXT
 */
export const scoreResumeFile = (jobId, file) => {
  const formData = new FormData()
  formData.append('resumeFile', file)
  formData.append('jobId', jobId)
  return api.post('/api/resume/score-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
