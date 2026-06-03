/**
 * Analytics Service
 * Handles click event recording and analytics queries
 */

const { generateIdempotencyKey, hashIpAddress } = require('./queue');
const logger = require('../utils/logger');

/**
 * Mock database for click events (replace with PostgreSQL in production)
 */
const mockClickEvents = [];

/**
 * Record click event to database
 * @param {Object} clickData - Click event data
 * @returns {Promise<Object>} - Recorded click event
 */
async function recordClickEvent(clickData) {
  try {
    const clickEvent = {
      id: Math.floor(Math.random() * 1000000),
      link_id: clickData.linkId,
      clicked_at: clickData.timestamp || new Date().toISOString(),
      user_agent: clickData.userAgent || null,
      referrer: clickData.referrer || null,
      ip_hash: clickData.ipHash,
      idempotency_key: clickData.idempotencyKey,
      created_at: new Date().toISOString()
    };
    
    mockClickEvents.push(clickEvent);
    
    logger.info({
      route: '/analytics/record',
      method: 'POST',
      link_id: clickData.linkId,
      ip_hash: clickData.ipHash,
      message: 'Click event recorded'
    });
    
    return clickEvent;
  } catch (error) {
    logger.error({
      route: '/analytics/record',
      method: 'POST',
      error_message: error.message,
      message: 'Failed to record click event'
    });
    throw error;
  }
}

/**
 * Get analytics for a link over a time window
 * @param {number} linkId - Link ID
 * @param {string} fromDate - Start date (ISO string)
 * @param {string} toDate - End date (ISO string)
 * @returns {Promise<Object>} - Analytics data
 */
async function getLinkAnalytics(linkId, fromDate, toDate) {
  try {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    // Filter click events by link_id and time window
    const filteredEvents = mockClickEvents.filter(event => {
      const clickedAt = new Date(event.clicked_at);
      return event.link_id === linkId && clickedAt >= from && clickedAt <= to;
    });
    
    const clickCount = filteredEvents.length;
    const lastClicked = filteredEvents.length > 0 
      ? filteredEvents[filteredEvents.length - 1].clicked_at 
      : null;
    
    return {
      link_id: linkId,
      from: fromDate,
      to: toDate,
      click_count: clickCount,
      last_clicked: lastClicked
    };
  } catch (error) {
    logger.error({
      route: '/analytics',
      method: 'GET',
      link_id: linkId,
      error_message: error.message,
      message: 'Failed to get analytics'
    });
    throw error;
  }
}

/**
 * Purge click events older than retention window
 * @param {number} retentionDays - Retention period in days
 * @returns {Promise<number>} - Number of events purged
 */
async function purgeOldClickEvents(retentionDays) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const initialCount = mockClickEvents.length;
    
    // Remove events older than cutoff
    for (let i = mockClickEvents.length - 1; i >= 0; i--) {
      const clickedAt = new Date(mockClickEvents[i].clicked_at);
      if (clickedAt < cutoffDate) {
        mockClickEvents.splice(i, 1);
      }
    }
    
    const purgedCount = initialCount - mockClickEvents.length;
    
    logger.info({
      route: '/analytics/purge',
      method: 'POST',
      retention_days: retentionDays,
      purged_count: purgedCount,
      message: 'Old click events purged'
    });
    
    return purgedCount;
  } catch (error) {
    logger.error({
      route: '/analytics/purge',
      method: 'POST',
      retention_days: retentionDays,
      error_message: error.message,
      message: 'Failed to purge old click events'
    });
    throw error;
  }
}

/**
 * Check if click event already exists (idempotency check)
 * @param {string} idempotencyKey - Idempotency key
 * @returns {Promise<boolean>} - True if event exists
 */
async function clickEventExists(idempotencyKey) {
  return mockClickEvents.some(event => event.idempotency_key === idempotencyKey);
}

module.exports = {
  recordClickEvent,
  getLinkAnalytics,
  purgeOldClickEvents,
  clickEventExists,
  mockClickEvents // Export for testing purposes
};
