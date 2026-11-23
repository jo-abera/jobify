/**
 * Password rules for registration and password changes.
 *
 * Policy:
 * - Minimum length: 6 characters
 * - Letters, numbers, and special characters: optional (not required)
 * - Spaces: allowed anywhere in the password
 *
 * Used by register, reset-password, and update-password handlers so rules stay in one place.
 */

const MIN_PASSWORD_LENGTH =
  Number(process.env.MIN_PASSWORD_LENGTH) || 6;

const PASSWORD_TOO_SHORT_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;

/**
 * @param {unknown} password - Raw password from the request body
 * @returns {{ valid: true } | { valid: false, message: string }}
 */
function validatePassword(password) {
  if (typeof password !== "string") {
    return { valid: false, message: PASSWORD_TOO_SHORT_MESSAGE };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: PASSWORD_TOO_SHORT_MESSAGE };
  }

  return { valid: true };
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  PASSWORD_TOO_SHORT_MESSAGE,
  validatePassword,
};