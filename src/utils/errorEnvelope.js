const crypto = require('crypto');

/**
 * Generate a UUID v4 using Node.js crypto module
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Standard error envelope structure
 * Ensures consistent error responses across the application
 */
class AppError extends Error {
  constructor(code, message, statusCode = 500, requestId = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a standardized error response envelope
 */
function createErrorEnvelope(error, requestId) {
  return {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      request_id: requestId || generateUUID()
    }
  };
}

/**
 * Known error codes mapping
 */
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

module.exports = {
  AppError,
  createErrorEnvelope,
  ErrorCodes
};
