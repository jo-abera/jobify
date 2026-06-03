/**
 * Role-based access control.
 *
 * Use after protect: restrict('admin'). Reads req.user.role from auth middleware.
 */

module.exports = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated and has one of the required roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do no have permission to perform this action.",
      });
    }

    // User has required role, so allow access
    next()
  };
};
