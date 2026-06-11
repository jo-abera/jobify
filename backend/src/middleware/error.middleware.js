/**
 * Express error-handling middleware.
 *
 * Catches unhandled errors passed via next(err). Logs the stack server-side
 * and returns a generic message so internal details are not leaked to clients.
 */

module.exports = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong' })
}
