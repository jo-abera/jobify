/**
 * Cloudinary helper for avatar uploads.
 * When CLOUDINARY_* env vars are set, avatars are stored as CDN URLs.
 * Otherwise callers can fall back to data URLs (local demo only).
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

module.exports = { isConfigured, uploadAvatar }
