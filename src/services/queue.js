/**
 * Queue Service for Async Analytics
 * Implements BullMQ for background job processing
 * 
 * NOTE: In production, install bullmq: npm install bullmq
 * This mock implementation demonstrates the pattern for development/testing
 */

const crypto = require('crypto');

// Mock job queue for demonstration (replace with BullMQ in production)
const mockQueue = {
  jobs: [],
  add: async function(name, data, options) {
    const job = {
      id: crypto.randomUUID(),
      name,
      data,
      options,
      createdAt: new Date(),
      attempts: 0,
      processed: false
    };
    this.jobs.push(job);
    return job;
  },
  process: async function(callback) {
    // Process all pending jobs
    for (const job of this.jobs) {
      if (!job.processed) {
        job.attempts++;
        try {
          await callback(job);
          job.processed = true;
          job.completedAt = new Date();
        } catch (error) {
          job.error = error.message;
          if (job.attempts >= (job.options?.attempts || 3)) {
            job.failed = true;
          }
        }
      }
    }
  },
  getJobs: function() {
    return this.jobs;
  },
  clear: function() {
    this.jobs = [];
  }
};

// Job names
const JOB_NAMES = {
  RECORD_CLICK: 'record_click'
};

/**
 * Enqueue a click recording job
 * @param {Object} clickData - Click event data
 * @returns {Promise<Object>} - Job object
 */
async function enqueueClickJob(clickData) {
  try {
    const job = await mockQueue.add(JOB_NAMES.RECORD_CLICK, clickData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: 100,
      removeOnFail: 50
    });
    return job;
  } catch (error) {
    console.error('Queue add error:', error.message);
    // If queue is down, log error but don't fail the redirect
    return null;
  }
}

/**
 * Process click recording jobs
 * @param {Function} processor - Job processor function
 * @returns {Promise<void>}
 */
async function processClickJobs(processor) {
  try {
    await mockQueue.process(processor);
  } catch (error) {
    console.error('Queue processing error:', error.message);
  }
}

/**
 * Generate idempotency key for click event
 * @param {string} linkId - Link ID
 * @param {string} ipHash - Hashed IP address
 * @param {number} timestamp - Timestamp
 * @returns {string} - Idempotency key
 */
function generateIdempotencyKey(linkId, ipHash, timestamp) {
  const keyString = `${linkId}:${ipHash}:${Math.floor(timestamp / 1000)}`; // 1-second window
  return crypto.createHash('sha256').update(keyString).digest('hex');
}

/**
 * Hash IP address for privacy
 * @param {string} ipAddress - IP address
 * @returns {string} - SHA-256 hash
 */
function hashIpAddress(ipAddress) {
  return crypto.createHash('sha256').update(ipAddress).digest('hex');
}

module.exports = {
  enqueueClickJob,
  processClickJobs,
  generateIdempotencyKey,
  hashIpAddress,
  JOB_NAMES,
  mockQueue // Export for testing purposes
};
