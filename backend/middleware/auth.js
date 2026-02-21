/**
 * ============================================================
 * HER – Auth Middleware (middleware/auth.js)
 * 
 * Protects private routes by verifying JWT tokens.
 * 
 * HOW JWT WORKS:
 * 1. User logs in → server creates a token containing their userId
 * 2. Token is sent back to frontend and stored (localStorage or cookie)
 * 3. Every protected request includes the token in the header:
 *    Authorization: Bearer <token>
 * 4. This middleware verifies the token is valid and not expired
 * 5. If valid → attaches user info to req.user → route runs
 * 6. If invalid/expired → returns 401 Unauthorized
 * ============================================================
 */

const jwt = require('jsonwebtoken');

// ===== PROTECT MIDDLEWARE =====
// Add this to any route that requires the user to be logged in
function protect(req, res, next) {

  // Get the Authorization header
  const authHeader = req.headers['authorization'];

  // Token format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided. Please log in.'
    });
  }

  // Extract just the token part (remove "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret key
    // If the token was tampered with or expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user info to the request
    // Route handlers can now access req.user.id, req.user.email, etc.
    req.user = decoded;

    // Pass control to the next middleware or route handler
    next();

  } catch (err) {
    // Token is invalid or expired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed. Please log in again.'
    });
  }
}

module.exports = { protect };
