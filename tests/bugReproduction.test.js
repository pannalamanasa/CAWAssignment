/**
 * Bug Reproduction Test
 * Demonstrates the idempotency bug causing duplicate click events
 */

const { enqueueClickJob, processClickJobs, hashIpAddress, generateIdempotencyKey, mockQueue } = require('../src/services/queue');
const { mockClickEvents } = require('../src/services/analytics');
const { processClickJob } = require('../src/services/worker');

console.log('=== Bug Reproduction Test: Idempotency Check Removed ===\n');

async function reproduceBug() {
  try {
    // Clear existing data
    mockClickEvents.length = 0;
    mockQueue.clear();
    
    console.log('Bug: Idempotency check removed in worker.js');
    console.log('Expected: Same job retried will create duplicate click events\n');
    
    // Enqueue the same job twice (simulating retry)
    const ipHash = hashIpAddress('192.168.1.1');
    const idempotencyKey = generateIdempotencyKey('123', ipHash, Date.now());
    
    const job1 = await enqueueClickJob({
      linkId: 123,
      ipHash,
      idempotencyKey,
      userAgent: 'Test',
      referrer: 'Test',
      timestamp: new Date().toISOString()
    });
    
    const job2 = await enqueueClickJob({
      linkId: 123,
      ipHash,
      idempotencyKey, // Same key (simulating retry)
      userAgent: 'Test',
      referrer: 'Test',
      timestamp: new Date().toISOString()
    });
    
    console.log(`Jobs enqueued: ${mockQueue.jobs.length}`);
    console.log(`Both jobs have same idempotency key: ${idempotencyKey}`);
    console.log();
    
    // Process jobs
    await processClickJobs(processClickJob);
    
    console.log(`Click events recorded: ${mockClickEvents.length}`);
    console.log(`Events with idempotency key ${idempotencyKey}: ${mockClickEvents.filter(e => e.idempotency_key === idempotencyKey).length}`);
    console.log();
    
    if (mockClickEvents.length === 2) {
      console.log('BUG REPRODUCED: Duplicate click events recorded');
      console.log('Expected: 1 event (idempotent)');
      console.log('Actual: 2 events (duplicate due to missing idempotency check)');
    } else {
      console.log('Bug not reproduced');
    }
    
    console.log();
    console.log('=== Bug Reproduction Complete ===');
    
  } catch (error) {
    console.error('Bug reproduction error:', error.message);
  }
}

reproduceBug();
