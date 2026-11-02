const jwt = require('jsonwebtoken');

// Protect routes: require a valid Bearer JWT and attach user id to req
function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. Please log in.',
    });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Access denied. Please log in.',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      error: 'Server is missing JWT_SECRET. Add it to backend/.env.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Reject tokens that verify but lack a user id (avoids unscoped DB queries)
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        error: 'Invalid or expired token. Please log in again.',
      });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token. Please log in again.',
    });
  }
}

module.exports = protect;
