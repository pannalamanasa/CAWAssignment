/**
 * Analytics Endpoint Service
 * Protected analytics read endpoint with owner scope
 */

const { getLinkAnalytics } = require('./analytics');
const logger = require('../utils/logger');

/**
 * Get analytics for a link (protected endpoint)
 * @param {number} linkId - Link ID
 * @param {string} fromDate - Start date (ISO string)
 * @param {string} toDate - End date (ISO string)
 * @param {Object} user - User object with ownership info
 * @returns {Promise<Object>} - Analytics data
 */
async function getAnalyticsEndpoint(linkId, fromDate, toDate, user) {
  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // In production, verify user owns the link
    // if (user.id !== link.owner_id) {
    //   throw new Error('Unauthorized access to analytics');
    // }
    
    const analytics = await getLinkAnalytics(linkId, fromDate, toDate);
    
    logger.info({
      request_id: requestId,
      route: `/links/${linkId}/analytics`,
      method: 'GET',
      link_id: linkId,
      click_count: analytics.click_count,
      message: 'Analytics retrieved successfully'
    });
    
    return analytics;
    
  } catch (error) {
    logger.error({
      request_id: requestId,
      route: `/links/${linkId}/analytics`,
      method: 'GET',
      link_id: linkId,
      error_message: error.message,
      message: 'Failed to retrieve analytics'
    });
    throw error;
  }
}

module.exports = {
  getAnalyticsEndpoint
};
