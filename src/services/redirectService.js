/**
 * Redirect Service with Cache-Aside Pattern
 * Demonstrates integration of cache service with redirect resolution
 */

const { getRedirectTarget, setRedirectTarget, invalidateRedirectTarget } = require('./cache');
const logger = require('../utils/logger');

/**
 * Mock database query (replace with actual database query in production)
 */
async function getLinkFromDatabase(code) {
  // Mock database query - in production this would query PostgreSQL
  const mockDatabase = {
    'abc123': 'https://example.com',
    'xyz789': 'https://google.com',
    'test123': 'https://github.com'
  };
  
  return mockDatabase[code] || null;
}

/**
 * Get redirect target using cache-aside pattern
 * @param {string} code - Short code
 * @returns {Promise<{url: string, source: string}>} - URL and cache source
 */
async function getRedirectWithCache(code) {
  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Step 1: Check cache first
    const cachedUrl = await getRedirectTarget(code);
    
    if (cachedUrl) {
      logger.info({
        request_id: requestId,
        route: `/r/${code}`,
        method: 'GET',
        status_code: 302,
        latency_ms: 5,
        cache_source: 'hit',
        message: 'Redirect served from cache'
      });
      return { url: cachedUrl, source: 'cache' };
    }
    
    // Step 2: Cache miss - query database
    logger.info({
      request_id: requestId,
      route: `/r/${code}`,
      method: 'GET',
      cache_source: 'miss',
      message: 'Cache miss, querying database'
    });
    
    const dbUrl = await getLinkFromDatabase(code);
    
    if (!dbUrl) {
      logger.warn({
        request_id: requestId,
        route: `/r/${code}`,
        method: 'GET',
        status_code: 404,
        message: 'Link not found in database'
      });
      return null;
    }
    
    // Step 3: Populate cache for future requests
    await setRedirectTarget(code, dbUrl, 3600); // 1 hour TTL
    
    logger.info({
      request_id: requestId,
      route: `/r/${code}`,
      method: 'GET',
      status_code: 302,
      latency_ms: 50, // Simulated DB latency
      cache_source: 'db_hit',
      message: 'Redirect served from database, cache populated'
    });
    
    return { url: dbUrl, source: 'database' };
    
  } catch (error) {
    logger.error({
      request_id: requestId,
      route: `/r/${code}`,
      method: 'GET',
      error_message: error.message,
      message: 'Error in redirect resolution'
    });
    throw error;
  }
}

/**
 * Update link and invalidate cache
 * @param {string} code - Short code
 * @param {string} newUrl - New long URL
 * @returns {Promise<boolean>} - Success status
 */
async function updateLinkWithCacheInvalidation(code, newUrl) {
  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Step 1: Update database (mock operation)
    logger.info({
      request_id: requestId,
      route: `/api/links/${code}`,
      method: 'PATCH',
      message: 'Updating link in database'
    });
    
    // In production: UPDATE links SET long_url = $1 WHERE short_code = $2
    
    // Step 2: Invalidate cache to prevent stale data
    await invalidateRedirectTarget(code);
    
    logger.info({
      request_id: requestId,
      route: `/api/links/${code}`,
      method: 'PATCH',
      message: 'Cache invalidated after update'
    });
    
    return true;
    
  } catch (error) {
    logger.error({
      request_id: requestId,
      route: `/api/links/${code}`,
      method: 'PATCH',
      error_message: error.message,
      message: 'Error updating link'
    });
    throw error;
  }
}

/**
 * Delete link and invalidate cache
 * @param {string} code - Short code
 * @returns {Promise<boolean>} - Success status
 */
async function deleteLinkWithCacheInvalidation(code) {
  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Step 1: Delete from database (mock operation)
    logger.info({
      request_id: requestId,
      route: `/api/links/${code}`,
      method: 'DELETE',
      message: 'Deleting link from database'
    });
    
    // In production: DELETE FROM links WHERE short_code = $1
    
    // Step 2: Invalidate cache
    await invalidateRedirectTarget(code);
    
    logger.info({
      request_id: requestId,
      route: `/api/links/${code}`,
      method: 'DELETE',
      message: 'Cache invalidated after deletion'
    });
    
    return true;
    
  } catch (error) {
    logger.error({
      request_id: requestId,
      route: `/api/links/${code}`,
      method: 'DELETE',
      error_message: error.message,
      message: 'Error deleting link'
    });
    throw error;
  }
}

module.exports = {
  getRedirectWithCache,
  updateLinkWithCacheInvalidation,
  deleteLinkWithCacheInvalidation
};
