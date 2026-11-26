/**
 * Persist user resume files until replaced.
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

function clearLocalUserFiles(userId) {
  if (!fs.existsSync(UPLOAD_DIR)) return
  for (const name of fs.readdirSync(UPLOAD_DIR)) {
    if (name === userId || name.startsWith(`${userId}.`)) {
      fs.unlinkSync(path.join(UPLOAD_DIR, name))
    }
  }
}

/**
 * @param {Buffer} buffer
 * @param {string} userId
 * @param {string} originalName
 * @returns {Promise<string>} public URL for User.resumeUrl
 */
async function saveResumeFile(buffer, userId, originalName) {
  if (cloudinary.isConfigured()) {
    return cloudinary.uploadResume(buffer, userId)
  }

  console.warn(
    '[resume] Cloudinary not configured — storing on local disk (dev only)'
  )

  const ext =
    originalnameExtension(originalName) || 'pdf'
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
  clearLocalUserFiles(userId)
  const fileName = `${userId}.${ext}`
  fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buffer)
  return `${publicBaseUrl()}/uploads/resumes/${fileName}`
}

function originalnameExtension(originalName) {
  const base = String(originalName || '').toLowerCase()
  const ext = base.split('.').pop()
  const allowed = ['pdf', 'docx', 'txt']
  return allowed.includes(ext) ? ext : null
}

/**
 * @param {string} userId
 * @param {string|null} resumeUrl
 */
async function removeResumeFile(userId, resumeUrl) {
  if (!resumeUrl) return

  if (cloudinary.isConfigured() && resumeUrl.includes('res.cloudinary.com')) {
    try {
      await cloudinary.destroyResume(userId)
    } catch (err) {
      console.warn('[resume] Cloudinary delete failed:', err.message)
    }
    return
  }

  if (resumeUrl.includes('/uploads/resumes/')) {
    clearLocalUserFiles(userId)
  }
}

/**
 * @param {string} resumeUrl
 * @param {string|null} mimeType
 * @param {string|null} fileName
 * @returns {Promise<Buffer>}
 */
async function fetchResumeBuffer(resumeUrl, mimeType, fileName) {
  if (!resumeUrl) {
    const err = new Error('No resume on file')
    err.statusCode = 404
    throw err
  }

  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
    const res = await fetch(resumeUrl)
    if (!res.ok) {
      const err = new Error('Could not load saved resume file')
      err.statusCode = 502
      throw err
    }
    return Buffer.from(await res.arrayBuffer())
  }

  const err = new Error('Unsupported resume storage URL')
  err.statusCode = 500
  throw err
}

module.exports = {
  saveResumeFile,
  removeResumeFile,
  fetchResumeBuffer,
  UPLOAD_DIR,
}