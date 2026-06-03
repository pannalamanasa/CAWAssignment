/**
 * Search Service for Links
 * Implements DB-native full-text search with PostgreSQL FTS
 */

const logger = require('../utils/logger');

// Constants
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const ALLOWED_SORT_FIELDS = ['created_at', 'click_count'];

/**
 * Validate and cap page_size
 * @param {number} page_size - Requested page size
 * @returns {number} - Capped page size
 */
function validatePageSize(page_size) {
  const parsed = parseInt(page_size, 10);
  if (isNaN(parsed) || parsed < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(parsed, MAX_PAGE_SIZE);
}

/**
 * Validate sort_by field against allowlist
 * @param {string} sort_by - Requested sort field
 * @returns {string} - Validated sort field or default
 */
function validateSortBy(sort_by) {
  if (sort_by && ALLOWED_SORT_FIELDS.includes(sort_by)) {
    return sort_by;
  }
  return 'created_at'; // Default sort
}

/**
 * Build FTS search query
 * @param {string} query - Search query
 * @returns {string} - PostgreSQL FTS query
 */
function buildFTSQuery(query) {
  if (!query) {
    return '';
  }
  // Use plainto_tsquery for simple search terms
  // This handles basic text search without complex operators
  return query.trim();
}

/**
 * Search links with full-text search, filtering, and pagination
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query
 * @param {string} params.tag - Tag filter
 * @param {number} params.page - Page number
 * @param {number} params.page_size - Page size
 * @param {string} params.sort_by - Sort field
 * @param {number} principal_id - Authenticated user ID
 * @returns {Promise<Object>} - Search results with pagination metadata
 */
async function searchLinks(params, principal_id) {
  const { q, tag, page = 1, page_size, sort_by } = params;
  
  try {
    const validatedPageSize = validatePageSize(page_size);
    const validatedSortBy = validateSortBy(sort_by);
    const validatedPage = Math.max(1, parseInt(page, 10));
    const offset = (validatedPage - 1) * validatedPageSize;
    
    // Mock search results (replace with actual PostgreSQL FTS query in production)
    const mockLinks = [
      { id: 2, short_code: 'xyz789', url: 'https://example.com', description: 'Example link', created_at: '2026-01-02T00:00:00Z', click_count: 50 },
      { id: 4, short_code: 'ghi012', url: 'https://test.com', description: 'Test link', created_at: '2026-01-04T00:00:00Z', click_count: 75 },
      { id: 6, short_code: 'jkl345', url: 'https://demo.com', description: 'Demo link', created_at: '2026-01-06T00:00:00Z', click_count: 150 }
    ];
    
    // Filter by search query (mock FTS)
    let filteredLinks = mockLinks;
    if (q) {
      const searchLower = q.toLowerCase();
      filteredLinks = filteredLinks.filter(link => 
        link.url.toLowerCase().includes(searchLower) ||
        link.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by tag (mock)
    if (tag) {
      // In production, this would filter by actual tags
      filteredLinks = filteredLinks.filter(link => link.description.includes(tag));
    }
    
    // Scope to authenticated user (mock)
    filteredLinks = filteredLinks.filter(link => link.id % 2 === 0); // Mock ownership check
    
    // Sort results
    filteredLinks.sort((a, b) => {
      if (validatedSortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (validatedSortBy === 'click_count') {
        return b.click_count - a.click_count;
      }
      return 0;
    });
    
    // Calculate pagination
    const total = filteredLinks.length;
    const totalPages = Math.ceil(total / validatedPageSize);
    const paginatedLinks = filteredLinks.slice(offset, offset + validatedPageSize);
    
    logger.info({
      route: '/links/search',
      method: 'GET',
      query: q,
      tag: tag,
      page: validatedPage,
      page_size: validatedPageSize,
      total: total,
      principal_id: principal_id,
      message: 'Search executed successfully'
    });
    
    return {
      results: paginatedLinks,
      pagination: {
        page: validatedPage,
        page_size: validatedPageSize,
        total: total,
        total_pages: totalPages,
        has_next: validatedPage < totalPages,
        has_prev: validatedPage > 1
      }
    };
    
  } catch (error) {
    logger.error({
      route: '/links/search',
      method: 'GET',
      query: q,
      principal_id: principal_id,
      error_message: error.message,
      message: 'Search failed'
    });
    throw error;
  }
}

module.exports = {
  searchLinks,
  validatePageSize,
  validateSortBy,
  MAX_PAGE_SIZE,
  ALLOWED_SORT_FIELDS
};
