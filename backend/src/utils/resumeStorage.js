/**
 * Persist user resume files (one object per version id).
 * Cloudinary when configured; otherwise local disk (dev fallback).
 */

const fs = require('fs')
const path = require('path')
const cloudinary = require('./cloudinary')

const UPLOAD_DIR = path.join(__dirname, '../../uploads/resumes')

function publicBaseUrl() {
  return (
    process.env.API_PUBLIC_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  )
}

function originalnameExtension(originalName) {
  const base = String(originalName || '').toLowerCase()
  const ext = base.split('.').pop()
  const allowed = ['pdf', 'docx', 'txt']
  return allowed.includes(ext) ? ext : null
}

/**
 * @param {Buffer} buffer
 * @param {string} storageKey - ResumeVersion.id
 * @param {string} originalName
 * @returns {Promise<string>} public URL
 */
function assertResumeStorageReady() {
  if (process.env.NODE_ENV === 'production' && !cloudinary.isConfigured()) {
    const err = new Error(
      'Resume storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    )
    err.statusCode = 503
    throw err
  }
}

async function saveResumeFile(buffer, storageKey, originalName) {
  assertResumeStorageReady()

  if (cloudinary.isConfigured()) {
    return cloudinary.uploadResume(buffer, storageKey, originalName)
  }

  console.warn(
    '[resume] Cloudinary not configured — storing on local disk (dev only)'
  )

  const ext = originalnameExtension(originalName) || 'pdf'
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
  const fileName = `${storageKey}.${ext}`
  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buffer)
  return `${publicBaseUrl()}/uploads/resumes/${fileName}`
}

/**
 * Delete stored object for one version (ignore missing).
 * @param {string} storageKey
 */
async function removeResumeFileByKey(storageKey, resumeUrl) {
  if (!storageKey && !resumeUrl) return

  if (cloudinary.isConfigured() && cloudinary.isCloudinaryUrl(resumeUrl)) {
    try {
      await cloudinary.destroyResumeByUrl(resumeUrl)
    } catch (err) {
      try {
        await cloudinary.destroyResume(storageKey)
      } catch (legacyErr) {
        console.warn('[resume] Cloudinary delete failed:', legacyErr.message || err.message)
      }
    }
    return
  }

  if (resumeUrl?.includes('/uploads/resumes/')) {
    const ext = originalnameExtension(resumeUrl) || 'pdf'
    const diskPath = path.join(UPLOAD_DIR, `${storageKey}.${ext}`)
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath)
    }
  }
}

/** @deprecated Use removeResumeFileByKey — legacy single-file layout */
async function removeResumeFile(userId, resumeUrl) {
  if (!resumeUrl) return

  if (cloudinary.isConfigured() && cloudinary.isCloudinaryUrl(resumeUrl)) {
    try {
      await cloudinary.destroyResumeByUrl(resumeUrl)
    } catch (err) {
      try {
        await cloudinary.destroyResume(userId)
      } catch (legacyErr) {
        console.warn('[resume] Cloudinary delete failed:', legacyErr.message || err.message)
      }
    }
    return
  }

  if (resumeUrl.includes('/uploads/resumes/') && fs.existsSync(UPLOAD_DIR)) {
    for (const name of fs.readdirSync(UPLOAD_DIR)) {
      if (name === userId || name.startsWith(`${userId}.`)) {
        fs.unlinkSync(path.join(UPLOAD_DIR, name))
      }
    }
  }
}

async function fetchResumeBuffer(resumeUrl, mimeType, fileName) {
  if (!resumeUrl) {
    const err = new Error('No resume on file')
    err.statusCode = 404
    throw err
  }

  if (resumeUrl.includes('/uploads/resumes/')) {
    const fileName = resumeUrl.split('/uploads/resumes/').pop().split('?')[0]
    const diskPath = path.join(UPLOAD_DIR, fileName)
    if (fs.existsSync(diskPath)) {
      return fs.readFileSync(diskPath)
    }
  }

  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
    const res = await fetch(resumeUrl, { redirect: 'follow' });
    if (!res.ok) {
      const err = new Error('Could not load saved resume file');
      err.statusCode = 502;
      throw err;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) {
      const err = new Error('Saved resume file is empty');
      err.statusCode = 502;
      throw err;
    }
    return buf;
  }

  const err = new Error('Unsupported resume storage URL')
  err.statusCode = 500
  throw err
}

module.exports = {
  saveResumeFile,
  removeResumeFile,
  removeResumeFileByKey,
  fetchResumeBuffer,
  isCloudinaryEnabled: cloudinary.isConfigured,
  UPLOAD_DIR,
}