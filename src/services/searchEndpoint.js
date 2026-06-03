/**
 * Search Endpoint Service
 * Protected search endpoint with authentication and pagination
 */

const { searchLinks } = require('./search');
const logger = require('../utils/logger');

/**
 * Search endpoint handler
 * @param {Object} query - Query parameters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} - Search results
 */
async function searchEndpoint(query, user) {
  const requestId = 'req-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Extract search parameters
    const { q, tag, page, page_size, sort_by } = query;
    
    // Get principal_id from authenticated user
    const principal_id = user.id || user.principal_id;
    
    // Execute search
    const results = await searchLinks({
      q,
      tag,
      page,
      page_size,
      sort_by
    }, principal_id);
    
    logger.info({
      request_id: requestId,
      route: '/links/search',
      method: 'GET',
      principal_id: principal_id,
      results_count: results.results.length,
      total_results: results.pagination.total,
      message: 'Search endpoint executed successfully'
    });
    
    return results;
    
  } catch (error) {
    logger.error({
      request_id: requestId,
      route: '/links/search',
      method: 'GET',
      error_message: error.message,
      message: 'Search endpoint failed'
    });
    throw error;
  }
}

module.exports = {
  searchEndpoint
};
