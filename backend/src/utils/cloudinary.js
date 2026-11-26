/**
 * Cloudinary — avatars (image) and resumes (raw) in folder jobify/*.
 * When CLOUDINARY_* env vars are set, profile media is stored on the CDN.
 * Otherwise callers can fall back to local disk / data URLs (dev only).
 */

const cloudinary = require('cloudinary').v2

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

function ensureConfigured() {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured')
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
}

/**
 * Upload image buffer to Cloudinary. One image per user (overwrite on re-upload).
 * @param {Buffer} buffer
 * @param {string} userId
 * @returns {Promise<string>} secure_url
 */
function uploadAvatar(buffer, userId) {
  ensureConfigured()

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'jobify/avatars',
        public_id: userId,
        overwrite: true,
        invalidate: true,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

function resumeFileExtension(originalName) {
  const base = String(originalName || '').toLowerCase()
  const ext = base.split('.').pop()
  const allowed = ['pdf', 'docx', 'txt']
  return allowed.includes(ext) ? ext : 'pdf'
}

/**
 * Upload one resume version (unique id per ResumeVersion row).
 * Raw files keep their extension so browsers serve the correct MIME type.
 * @returns {Promise<string>} secure_url
 */
function uploadResume(buffer, storageKey, originalName) {
  ensureConfigured()
  const ext = resumeFileExtension(originalName)
  const publicId = `${storageKey}.${ext}`

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'jobify/resumes',
        public_id: publicId,
        overwrite: false,
        resource_type: 'raw',
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

/** e.g. https://res.cloudinary.com/.../raw/upload/v123/jobify/resumes/uuid.pdf */
function publicIdFromSecureUrl(secureUrl) {
  if (!secureUrl || !secureUrl.includes('res.cloudinary.com')) return null
  const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\?|#|$)/)
  if (!match) return null
  return decodeURIComponent(match[1])
}

function isCloudinaryUrl(url) {
  return Boolean(url && url.includes('res.cloudinary.com'))
}

/** Remove one raw resume by CDN URL (works with or without file extension in public id). */
function destroyResumeByUrl(resumeUrl) {
  ensureConfigured()
  const publicId = publicIdFromSecureUrl(resumeUrl)
  if (!publicId) {
    return Promise.resolve({ result: 'not found' })
  }
  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    invalidate: true,
  })
}

/** @deprecated Prefer destroyResumeByUrl — legacy uploads used bare version id */
function destroyResume(storageKey) {
  ensureConfigured()
  return cloudinary.uploader.destroy(`jobify/resumes/${storageKey}`, {
    resource_type: 'raw',
    invalidate: true,
  })
}

module.exports = {
  isConfigured,
  isCloudinaryUrl,
  uploadAvatar,
  uploadResume,
  destroyResume,
  destroyResumeByUrl,
  publicIdFromSecureUrl,
}
