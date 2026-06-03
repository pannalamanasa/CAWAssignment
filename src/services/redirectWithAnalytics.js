/**
 * Redirect Service with Analytics Recording
 * Integrates async queue for click event recording
 */

const { getRedirectWithCache } = require('./redirectService');
const { enqueueClickJob, generateIdempotencyKey, hashIpAddress } = require('./queue');
const logger = require('../utils/logger');

/**
 * Get redirect with analytics recording
 * @param {string} code - Short code
 * @param {Object} request - Request object with metadata
 * @returns {Promise<{url: string, source: string}>} - URL and cache source
 */
async function getRedirectWithAnalytics(code, request = {}) {
  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Step 1: Get redirect target (with cache-aside)
    const redirectResult = await getRedirectWithCache(code);
    
    if (!redirectResult) {
      return null;
    }
    
    // Step 2: Enqueue analytics job (non-blocking)
    const timestamp = Date.now();
    const ipHash = hashIpAddress(request.ip || '127.0.0.1');
    const idempotencyKey = generateIdempotencyKey(
      redirectResult.linkId || code,
      ipHash,
      timestamp
    );
    
    const clickData = {
      linkId: redirectResult.linkId || code,
      ipHash,
      idempotencyKey,
      userAgent: request.userAgent || null,
      referrer: request.referrer || null,
      timestamp: new Date(timestamp).toISOString()
    };
    
    // Enqueue job asynchronously (don't await)
    enqueueClickJob(clickData).catch(error => {
      logger.warn({
        request_id: requestId,
        route: `/r/${code}`,
        error_message: error.message,
        message: 'Failed to enqueue analytics job (non-blocking)'
      });
    });
    
    logger.info({
      request_id: requestId,
      route: `/r/${code}`,
      method: 'GET',
      status_code: 302,
      cache_source: redirectResult.source,
      analytics_enqueued: true,
      message: 'Redirect with analytics recording'
    });
    
    return redirectResult;
    
  } catch (error) {
    logger.error({
      request_id: requestId,
      route: `/r/${code}`,
      method: 'GET',
      error_message: error.message,
      message: 'Error in redirect with analytics'
    });
    throw error;
  }
}

module.exports = {
  getRedirectWithAnalytics
};
