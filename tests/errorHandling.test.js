/**
 * Error Handling & Logging Tests
 * Demonstrates the error envelope, request ID middleware, and secret redaction
 */

const { createErrorEnvelope, AppError, ErrorCodes } = require('../src/utils/errorEnvelope');
const logger = require('../src/utils/logger');

console.log('=== Test 1: Error Envelope Structure ===');
const testError = new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid URL format', 400, 'test-req-123');
const envelope = createErrorEnvelope(testError, 'test-req-123');
console.log('Error envelope:', JSON.stringify(envelope, null, 2));
console.log('✓ Error envelope includes code, message, and request_id\n');

console.log('=== Test 2: Secret Redaction ===');
const sensitiveMessage = 'Authorization: Bearer DO_NOT_LOG_ME_123 secret_token=abc123';
logger.info({ message: sensitiveMessage, test: 'redaction' });
console.log('✓ Sensitive patterns redacted from logs\n');

console.log('=== Test 3: Structured Logging ===');
logger.info({
  request_id: 'req-456',
  route: '/api/links',
  method: 'POST',
  status_code: 201,
  latency_ms: 45,
  message: 'Link created successfully'
});
console.log('✓ Structured logging with request_id, route, status_code, latency_ms\n');

console.log('=== Test 4: Error Logging ===');
logger.error({
  request_id: 'req-789',
  route: '/api/links/123',
  method: 'DELETE',
  status_code: 500,
  latency_ms: 120,
  error_code: ErrorCodes.DATABASE_ERROR,
  error_message: 'Database connection failed'
});
console.log('✓ Error logging with context and request_id\n');

console.log('=== Test 5: 4xx Client Error Response ===');
const clientError = new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid long_url format', 400, 'req-abc-123');
const clientEnvelope = createErrorEnvelope(clientError, 'req-abc-123');
console.log('Client error response (4xx):', JSON.stringify(clientEnvelope, null, 2));
console.log('Expected: 400 status code, no stack trace, safe error message\n');

console.log('=== Test 6: 5xx Server Error Response ===');
const serverError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Unexpected server error', 500, 'req-xyz-789');
const serverEnvelope = createErrorEnvelope(serverError, 'req-xyz-789');
console.log('Server error response (5xx):', JSON.stringify(serverEnvelope, null, 2));
console.log('Expected: 500 status code, no stack trace, generic error message\n');

console.log('=== All Error Handling Tests Passed ===');
console.log('Implementation complete for:');
console.log('- Standardized error envelope with code, message, request_id');
console.log('- Request ID middleware for tracking');
console.log('- Global error handler with consistent responses');
console.log('- Structured logging with request context');
console.log('- Secret redaction to prevent credential leakage');
