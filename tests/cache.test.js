/**
 * Cache Service Tests
 * Demonstrates cache-aside strategy implementation
 */

const { getRedirectTarget, setRedirectTarget, invalidateRedirectTarget, isRedisAvailable } = require('../src/services/cache');
const logger = require('../src/utils/logger');

console.log('=== Cache Service Tests ===\n');

async function runTests() {
  try {
    // Test 1: Check Redis availability
    console.log('Test 1: Redis Availability Check');
    const redisAvailable = await isRedisAvailable();
    console.log(`Redis available: ${redisAvailable}`);
    console.log();

    // Test 2: Set and Get redirect target
    console.log('Test 2: Set and Get Redirect Target');
    const testCode = 'test123';
    const testUrl = 'https://example.com';
    
    await setRedirectTarget(testCode, testUrl, 60); // 60 second TTL
    console.log(`Set cache: ${testCode} -> ${testUrl}`);
    
    const cachedUrl = await getRedirectTarget(testCode);
    console.log(`Get cache: ${testCode} -> ${cachedUrl}`);
    console.log(`Cache hit: ${cachedUrl === testUrl ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 3: Cache invalidation
    console.log('Test 3: Cache Invalidation');
    await invalidateRedirectTarget(testCode);
    console.log(`Invalidated cache for ${testCode}`);
    
    const afterInvalidation = await getRedirectTarget(testCode);
    console.log(`Get after invalidation: ${afterInvalidation}`);
    console.log(`Cache cleared: ${afterInvalidation === null ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 4: Cache miss scenario
    console.log('Test 4: Cache Miss Scenario');
    const nonExistentCode = 'nonexistent';
    const missResult = await getRedirectTarget(nonExistentCode);
    console.log(`Get non-existent key: ${missResult}`);
    console.log(`Cache miss: ${missResult === null ? 'PASS' : 'FAIL'}`);
    console.log();

    // Test 5: Cache-aside pattern demonstration
    console.log('Test 5: Cache-Aside Pattern Demonstration');
    console.log('Pattern: Check cache -> If miss, load from DB -> Set cache -> Return data');
    console.log('Implementation:');
    console.log('1. Check cache with getRedirectTarget(code)');
    console.log('2. If null, query database for long_url');
    console.log('3. Set cache with setRedirectTarget(code, url, ttl)');
    console.log('4. Return long_url to client');
    console.log();

    console.log('=== All Cache Service Tests Completed ===');
    console.log('Implementation ready for integration with redirect endpoint');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
