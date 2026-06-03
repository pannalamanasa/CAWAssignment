/**
 * Pagination Bug Reproduction Test
 * Demonstrates off-by-one error in pagination offset calculation
 */

const { searchLinks } = require('../src/services/search');

console.log('=== Pagination Bug Reproduction Test ===\n');

async function reproducePaginationBug() {
  try {
    console.log('Bug: Off-by-one error in offset calculation');
    console.log('Expected: offset = (page - 1) * page_size');
    console.log('Actual: offset = page * page_size');
    console.log();

    // Test with page=1, page_size=2
    console.log('Test 1: Page 1, Page Size 2');
    const results1 = await searchLinks({ q: '', page: 1, page_size: 2 }, 1);
    console.log(`Page: ${results1.pagination.page}`);
    console.log(`Page size: ${results1.pagination.page_size}`);
    console.log(`Results count: ${results1.results.length}`);
    console.log(`Expected results: 2 (first 2 items)`);
    console.log(`Actual results: ${results1.results.length}`);
    console.log(`Status: ${results1.results.length === 0 ? 'BUG REPRODUCED (skipped first page)' : 'Bug not reproduced'}`);
    console.log();

    // Test with page=2, page_size=2
    console.log('Test 2: Page 2, Page Size 2');
    const results2 = await searchLinks({ q: '', page: 2, page_size: 2 }, 1);
    console.log(`Page: ${results2.pagination.page}`);
    console.log(`Page size: ${results2.pagination.page_size}`);
    console.log(`Results count: ${results2.results.length}`);
    console.log(`Expected results: 1 (remaining items)`);
    console.log(`Actual results: ${results2.results.length}`);
    console.log(`Status: ${results2.results.length === 0 ? 'BUG REPRODUCED (skipped second page)' : 'Bug not reproduced'}`);
    console.log();

    console.log('=== Bug Reproduction Complete ===');
    console.log('Summary:');
    console.log('- Off-by-one error causes offset to skip entire first page');
    console.log('- Page 1 with page_size=2 returns 0 results instead of 2');
    console.log('- Page 2 with page_size=2 returns 0 results instead of 1');
    console.log('- Fix: Change offset from page * page_size to (page - 1) * page_size');

  } catch (error) {
    console.error('Bug reproduction error:', error.message);
  }
}

reproducePaginationBug();
