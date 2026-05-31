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



const jwt = require('jsonwebtoken');

module.exports = function (req, res, next){
    const token = req.header.authoruzation?.split(' ')[1];

    if(!token) return res.status(401).json({message: 'Access denied. No token provided.'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId
        next();
    }catch{
        res.status(401).json({message: 'Invalid token.'});
    }
}

