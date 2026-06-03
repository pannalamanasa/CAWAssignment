const { createErrorEnvelope, ErrorCodes } = require('../utils/errorEnvelope');
const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */
function errorHandler(err, req, res, next) {
  const requestId = req.requestId || 'unknown';
  const startTime = req.startTime || Date.now();
  const latency = Date.now() - startTime;

  // Log error with context
  logger.error({
    request_id: requestId,
    route: req.path,
    method: req.method,
    status_code: err.statusCode || 500,
    latency_ms: latency,
    error_code: err.code || ErrorCodes.INTERNAL_ERROR,
    error_message: err.message,
    // Redact sensitive information from error details
    stack_trace: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Create error envelope
  const errorEnvelope = createErrorEnvelope(err, requestId);

  // Send response
  res.status(statusCode).json(errorEnvelope);
}

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.code = ErrorCodes.NOT_FOUND;
  error.statusCode = 404;
  next(error);
}

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
