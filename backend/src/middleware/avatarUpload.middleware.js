/**
 * Avatar upload middleware.
 *
 * Accepts a single image file (multipart field: avatar) and stores it in memory.
 * The controller converts it to a data URL and persists it to User.avatar.
 *
 * Design choice: store image as data URL for this demo so we don't need
 * object storage (S3/Supabase) or a static file host. Works well for small avatars.
 */

/** Multer reads the file into memory; the controller uploads to Cloudinary
 * (or falls back to a data URL when Cloudinary env vars are unset). */

const multer = require("multer");

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 mb

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_AVATAR_BYTES },
  fileFilter(req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Avatar must be an image file (PNG, JPG, WEBP, etc.)."));
    }
  },
});

const uploadAvatar = upload.single("avatar");

/**
 * Wraps Multer errors into JSON responses.
 */

function handleAvatarUpload(req, res, next) {
  uploadAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Avatar file is too large. Maximum size is 5 MB",
        });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) return res.status(400).json({ message: err.message });

    next();
  });
}

module.exports = { handleAvatarUpload, MAX_AVATAR_BYTES };
