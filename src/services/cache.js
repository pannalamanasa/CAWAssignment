/**
 * Cache Service for URL Shortener
 * Implements cache-aside strategy with Redis
 * 
 * NOTE: In production, install ioredis: npm install ioredis
 * This mock implementation demonstrates the pattern for development/testing
 */

// Mock in-memory cache for demonstration (replace with Redis in production)
const mockCache = new Map();

// Redis client configuration (uncomment when ioredis is installed)
// const Redis = require('ioredis');
// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//   maxRetriesPerRequest: 3,
//   retryStrategy: (times) => {
//     if (times > 3) {
//       return null; // Stop retrying after 3 attempts
//     }
//     return Math.min(times * 50, 200); // Exponential backoff
//   },
//   enableOfflineQueue: false // Don't queue commands when offline
// });

// Cache key prefix
const CACHE_PREFIX = 'link:';
const DEFAULT_TTL = 3600; // 1 hour in seconds

/**
 * Get redirect target from cache
 * @param {string} code - Short code
 * @returns {Promise<string|null>} - Long URL or null if not found
 */
async function getRedirectTarget(code) {
  try {
    const key = `${CACHE_PREFIX}${code}`;
    // Mock implementation (replace with redis.get(key) when using Redis)
    const result = mockCache.get(key);
    return result || null;
  } catch (error) {
    // If Redis is down, return null to trigger DB fallback
    console.error('Cache get error:', error.message);
    return null;
  }
}

/**
 * Set redirect target in cache
 * @param {string} code - Short code
 * @param {string} url - Long URL
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
async function setRedirectTarget(code, url, ttlSeconds = DEFAULT_TTL) {
  try {
    const key = `${CACHE_PREFIX}${code}`;
    // Mock implementation (replace with redis.set(key, url, 'EX', ttlSeconds) when using Redis)
    mockCache.set(key, url);
    // Simulate TTL with setTimeout (in production, Redis handles this)
    setTimeout(() => {
      mockCache.delete(key);
    }, ttlSeconds * 1000);
    return true;
  } catch (error) {
    // If Redis is down, log error but don't fail the operation
    console.error('Cache set error:', error.message);
    return false;
  }
}

/**
 * Invalidate redirect target in cache
 * @param {string} code - Short code
 * @returns {Promise<boolean>} - Success status
 */
async function invalidateRedirectTarget(code) {
  try {
    const key = `${CACHE_PREFIX}${code}`;
    // Mock implementation (replace with redis.del(key) when using Redis)
    mockCache.delete(key);
    return true;
  } catch (error) {
    // If Redis is down, log error but don't fail the operation
    console.error('Cache invalidate error:', error.message);
    return false;
  }
}

/**
 * Check if Redis is available
 * @returns {Promise<boolean>} - Redis availability status
 */
async function isRedisAvailable() {
  try {
    // Mock implementation (replace with redis.ping() when using Redis)
    return true; // Always available in mock mode
  } catch (error) {
    return false;
  }
}

module.exports = {
  getRedirectTarget,
  setRedirectTarget,
  invalidateRedirectTarget,
  isRedisAvailable,
  mockCache // Export for testing purposes
};
