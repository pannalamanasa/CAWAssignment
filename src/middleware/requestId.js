const crypto = require('crypto');

/**
 * Generate a UUID v4 using Node.js crypto module
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Request ID Middleware
 * Generates a unique request ID for each incoming request
 * and attaches it to the request object and response headers
 */
function requestIdMiddleware(req, res, next) {
  // Generate or use existing request ID from header
  const requestId = req.headers['x-request-id'] || generateUUID();
  
  // Attach to request for use in downstream middleware and handlers
  req.requestId = requestId;
  
  // Attach to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

module.exports = { requestIdMiddleware };
