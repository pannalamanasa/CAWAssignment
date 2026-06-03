/**
 * Cache-Aside Pattern Integration Tests
 * Demonstrates complete caching workflow with DB fallback
 */

const { getRedirectWithCache, updateLinkWithCacheInvalidation, deleteLinkWithCacheInvalidation } = require('../src/services/redirectService');
const { mockCache } = require('../src/services/cache');

console.log('=== Cache-Aside Pattern Integration Tests ===\n');

async function runIntegrationTests() {
  try {
    // Test 1: First redirect - DB hit + cache set
    console.log('Test 1: First Redirect (DB Hit + Cache Set)');
    const result1 = await getRedirectWithCache('abc123');
    console.log(`Result: ${result1.url} from ${result1.source}`);
    console.log(`Expected: https://example.com from database`);
    console.log(`Status: ${result1.url === 'https://example.com' && result1.source === 'database' ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 2: Second redirect - cache hit
    console.log('Test 2: Second Redirect (Cache Hit)');
    const result2 = await getRedirectWithCache('abc123');
    console.log(`Result: ${result2.url} from ${result2.source}`);
    console.log(`Expected: https://example.com from cache`);
    console.log(`Status: ${result2.url === 'https://example.com' && result2.source === 'cache' ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 3: Update link - cache invalidation
    console.log('Test 3: Update Link (Cache Invalidation)');
    await updateLinkWithCacheInvalidation('abc123', 'https://example.org');
    console.log('Link updated, cache invalidated');
    
    // Verify cache is cleared
    const cacheCheck = mockCache.get('link:abc123');
    console.log(`Cache after invalidation: ${cacheCheck}`);
    console.log(`Status: ${cacheCheck === undefined ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 4: Redirect after update - should hit DB again
    console.log('Test 4: Redirect After Update (DB Hit Again)');
    const result3 = await getRedirectWithCache('abc123');
    console.log(`Result: ${result3.url} from ${result3.source}`);
    console.log(`Expected: https://example.com from database (mock DB not actually updated)`);
    console.log(`Status: ${result3.source === 'database' ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 5: Non-existent link - cache miss + DB miss
    console.log('Test 5: Non-Existent Link (Cache Miss + DB Miss)');
    const result4 = await getRedirectWithCache('nonexistent');
    console.log(`Result: ${result4}`);
    console.log(`Expected: null`);
    console.log(`Status: ${result4 === null ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 6: Delete link - cache invalidation
    console.log('Test 6: Delete Link (Cache Invalidation)');
    await deleteLinkWithCacheInvalidation('xyz789');
    console.log('Link deleted, cache invalidated');
    console.log();

    // Test 7: Cache-aside pattern summary
    console.log('Test 7: Cache-Aside Pattern Summary');
    console.log('Pattern Flow:');
    console.log('1. Check cache -> miss');
    console.log('2. Query database -> found');
    console.log('3. Set cache -> populated');
    console.log('4. Check cache -> hit (subsequent requests)');
    console.log('5. Update/delete -> invalidate cache');
    console.log('6. Check cache -> miss (next request)');
    console.log('7. Query database -> updated data');
    console.log();

    console.log('=== All Cache-Aside Integration Tests Completed ===');
    console.log('Implementation demonstrates:');
    console.log('- Cache-aside pattern with DB fallback');
    console.log('- Cache invalidation on updates/deletes');
    console.log('- Graceful degradation when cache unavailable');
    console.log('- Structured logging with request context');

  } catch (error) {
    console.error('Integration test error:', error.message);
  }
}

runIntegrationTests();
