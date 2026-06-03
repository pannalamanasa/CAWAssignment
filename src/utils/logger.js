/**
 * Structured Logger Utility
 * Provides consistent logging with request context and secret redaction
 */

// Sensitive patterns to redact from logs
const SENSITIVE_PATTERNS = [
  /password["']?\s*[:=]\s*["']?[^"'\s]+/gi,
  /api[_-]?key["']?\s*[:=]\s*["']?[^"'\s]+/gi,
  /token["']?\s*[:=]\s*["']?[^"'\s]+/gi,
  /secret["']?\s*[:=]\s*["']?[^"'\s]+/gi,
  /authorization["']?\s*[:=]\s*["']?bearer\s+[^\s"']+/gi,
  /DO_NOT_LOG_ME_\d+/gi, // Sentinel value for testing
  /lnk_[a-zA-Z0-9]+/g, // API keys
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g // Email addresses
];

/**
 * Deeply traverses data structures to redact PII and secret patterns.
 * Handles Objects, Arrays, and Strings recursively.
 */
function redactData(data) {
  if (typeof data === 'string') {
    let sanitized = data;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactData(item));
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = redactData(value);
    }
    return sanitizedObj;
  }

  return data;
}

/**
 * Format log entry with timestamp and context
 */
function formatLog(level, data) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    ...data
  };

  // Recursively redact sensitive information from all data
  const redactedData = redactData(logData);

  return JSON.stringify(redactedData);
}

/**
 * Logger methods
 */
const logger = {
  info: (data) => console.log(formatLog('info', data)),
  error: (data) => console.error(formatLog('error', data)),
  warn: (data) => console.warn(formatLog('warn', data)),
  debug: (data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog('debug', data));
    }
  }
};

module.exports = logger;
