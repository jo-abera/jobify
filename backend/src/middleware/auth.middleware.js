/**
 * JWT authentication middleware.
 *
 * Expects `Authorization: Bearer <token>`(attached by the frontend axios interceptor). On success, sets `req.userId` for downstream controllers.
 *
 * This middleware checks for the presence of a JWT token in the Authorization header of the incoming request. If a token is found, it verifies the token using the secret key defined in the environment variables. If the token is valid, it extracts the user ID from the token and attaches it to the request object for use in subsequent middleware or route handlers. If the token is missing or invalid, it responds with a 401 Unauthorized status and an appropriate error message.
 *
 * Usage:
 *
 * const authMiddleware = require('./middleware/auth.middleware');
 */

const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    // Step 1 - get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Step 2 - if no token, block access
    if (!token) {
      return res.status(401).json({
        message: "You are not logged in. Please login to get access.",
      });
    }
    // Step 3 - verfy token is valid
    const decoded = jwt.verfiy(token, process.env.JWT_SECRET);

    // Step 4 - if token is invalid, throw error--added by me
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
      });
    }
    // step 5 - check user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    // Step 6 - if current user doesnot exist, block access
    if (!currentUser) {
      return res.status(401).json({
        message: "The user belonging to this token doesnot exists.",
      });
    }

    // Step 7 - if user is banned, block accesss
    if (currentUser.isBanned) {
      return res.status(401).json({
        message: "Your account has been banned. Please contact support.",
      });
    }

    // step 8 - if user recently changed password, block access
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10,
      );

      if (decoded.iat < changedTimestamp) {
        return res.staus(401).json({
          message: "User recently changed password. Please log in again.",
        });
      }
    }
    // Step 10 - set req.user and req.userId
    req.user = currentUser;
    req.userId = currentUser.id;
    next();
  } catch (err) {
    // Step 11 - if token is invalid or expired, block access
    return res.staus(401).json({ message: "Invalid or expired token" });
  }
};
