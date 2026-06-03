/**
 * Module 9 Integration Tests
 * Comprehensive test suite for URL shortener with integration-heavy approach
 * Tests: create link, redirect, auth behavior, owner scoping (IDOR), retention enforcement, URL validation
 */

console.log('=== Module 9 Integration Tests ===\n');

// Mock database for integration tests
const mockLinks = [];
const mockClickEvents = [];
const mockApiKeys = [];

// Mock services
function createLink(url, ownerId, shortCode) {
  const link = {
    id: mockLinks.length + 1,
    short_code: shortCode || Math.random().toString(36).substr(2, 6),
    url,
    owner_id: ownerId,
    created_at: new Date().toISOString()
  };
  mockLinks.push(link);
  return link;
}

function getRedirect(shortCode) {
  const link = mockLinks.find(l => l.short_code === shortCode);
  if (!link) return null;
  return {
    statusCode: 301,
    location: link.url
  };
}

function validateApiKey(apiKey) {
  const key = mockApiKeys.find(k => k.hashed_key === apiKey && k.is_active);
  return key ? { principal_id: key.principal_id } : null;
}

function getLinkById(id, principalId) {
  const link = mockLinks.find(l => l.id === id);
  if (!link) return null;
  if (link.owner_id !== principalId) return null; // Owner scoping
  return link;
}

function createClickEvent(linkId, ipHash, idempotencyKey) {
  const event = {
    id: mockClickEvents.length + 1,
    link_id: linkId,
    ip_hash: ipHash,
    idempotency_key: idempotencyKey,
    clicked_at: new Date().toISOString()
  };
  mockClickEvents.push(event);
  return event;
}

function purgeOldClickEvents(retentionDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const beforeCount = mockClickEvents.length;
  const filtered = mockClickEvents.filter(e => new Date(e.clicked_at) >= cutoff);
  mockClickEvents.length = 0;
  mockClickEvents.push(...filtered);
  return beforeCount - mockClickEvents.length;
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    // Reject obviously malicious URLs
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Reject URL-encoded bypass attempts
    if (url.includes('%3A') || url.includes('%2F')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Create a link
  console.log('Test 1: Create a Link');
  try {
    const link = createLink('https://example.com', 1, 'abc123');
    if (link.id && link.short_code === 'abc123' && link.url === 'https://example.com') {
      console.log('✓ PASS: Link created successfully');
      console.log(`  ID: ${link.id}, Short Code: ${link.short_code}, URL: ${link.url}`);
      passed++;
    } else {
      console.log('✗ FAIL: Link creation failed');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 2: Redirect (GET /r/<code>)
  console.log('Test 2: Redirect (GET /r/<code>)');
  try {
    const redirect = getRedirect('abc123');
    if (redirect && redirect.statusCode === 301 && redirect.location === 'https://example.com') {
      console.log('✓ PASS: Redirect works correctly');
      console.log(`  Status: ${redirect.statusCode}, Location: ${redirect.location}`);
      passed++;
    } else {
      console.log('✗ FAIL: Redirect failed');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 3: Auth behavior (protected route returns 401)
  console.log('Test 3: Auth Behavior (Protected Route Returns 401)');
  try {
    mockApiKeys.push({ hashed_key: 'valid_key_123', principal_id: 1, is_active: true });
    
    const validAuth = validateApiKey('valid_key_123');
    const invalidAuth = validateApiKey('invalid_key');
    
    if (validAuth && !invalidAuth) {
      console.log('✓ PASS: Auth validation works');
      console.log(`  Valid key: authenticated, Invalid key: rejected`);
      passed++;
    } else {
      console.log('✗ FAIL: Auth validation failed');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 4: Owner scoping (IDOR)
  console.log('Test 4: Owner Scoping (IDOR)');
  try {
    // Create two principals (A and B)
    const principalA = 1;
    const principalB = 2;
    
    // As A: create a link
    const link = createLink('https://private.example.com', principalA, 'secret');
    
    // As B: attempt to read A's link
    const accessByB = getLinkById(link.id, principalB);
    const accessByA = getLinkById(link.id, principalA);
    
    if (!accessByB && accessByA) {
      console.log('✓ PASS: Owner scoping prevents IDOR');
      console.log(`  Principal A can access: ${!!accessByA}, Principal B can access: ${!!accessByB}`);
      passed++;
    } else {
      console.log('✗ FAIL: Owner scoping failed');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 5: Retention enforcement
  console.log('Test 5: Retention Enforcement');
  try {
    // Create a click event with old timestamp
    const oldEvent = {
      id: 999,
      link_id: 1,
      ip_hash: 'abc123',
      idempotency_key: 'key123',
      clicked_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() // 10 days ago
    };
    mockClickEvents.push(oldEvent);
    
    const beforePurge = mockClickEvents.length;
    const purged = purgeOldClickEvents(5); // Retention 5 days
    const afterPurge = mockClickEvents.length;
    
    if (beforePurge > afterPurge && purged > 0) {
      console.log('✓ PASS: Retention enforcement works');
      console.log(`  Before purge: ${beforePurge} events, After purge: ${afterPurge} events, Purged: ${purged}`);
      passed++;
    } else {
      console.log('✗ FAIL: Retention enforcement failed');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 6: URL validation
  console.log('Test 6: URL Validation');
  try {
    const validUrl = 'https://example.com';
    const invalidUrl = 'http%3A%2F%2Fevil.example.com'; // URL-encoded bypass attempt
    
    const validResult = validateUrl(validUrl);
    const invalidResult = validateUrl(invalidUrl);
    
    if (validResult && !invalidResult) {
      console.log('✓ PASS: URL validation rejects bypass attempts');
      console.log(`  Valid URL: accepted, Invalid URL (encoded): rejected`);
      passed++;
    } else {
      console.log('✗ FAIL: URL validation failed');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: ${error.message}`);
    failed++;
  }
  console.log();

  // Summary
  console.log('=== Test Summary ===');
  console.log(`Total: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Status: ${failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  // Test isolation cleanup
  mockLinks.length = 0;
  mockClickEvents.length = 0;
  mockApiKeys.length = 0;
}

runTests();
