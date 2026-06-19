/**
 * Multer upload middleware for resume files.
 *
 * Stores files in memory (no disk writes). Used by POST /api/resume/score-file
 * before resumeParser extracts text. Limits size and allowed extensions.
 */

const multer = require('multer')

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const storage = multer.memoryStorage()

const multerUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    const ext = file.originalname.toLowerCase().split('.').pop()
    const allowed = ['pdf', 'docx', 'txt']
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed.'))
    }
  }
})

const uploadResume = multerUpload.single('resumeFile')

/**
 * Express middleware wrapper — maps Multer errors to 400 JSON responses.
 */
function handleResumeUpload(req, res, next) {
  uploadResume(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 5 MB.' })
      }
      return res.status(400).json({ message: err.message })
    }
    if (err) {
      return res.status(400).json({ message: err.message })
    }
    next()
  })
}

module.exports = { handleResumeUpload, MAX_FILE_SIZE }
