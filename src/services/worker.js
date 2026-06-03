/**
 * Worker Service for Async Job Processing
 * Processes click recording jobs from the queue
 */

const { recordClickEvent, clickEventExists } = require('./analytics');
const logger = require('../utils/logger');

/**
 * Process a single click recording job
 * @param {Object} job - Job object with data
 * @returns {Promise<void>}
 */
async function processClickJob(job) {
  const { data } = job;
  const { linkId, ipHash, idempotencyKey, userAgent, referrer, timestamp } = data;
  
  try {
    // Idempotency check: skip if already recorded
    const exists = await clickEventExists(idempotencyKey);
    if (exists) {
      logger.info({
        job_id: job.id,
        idempotency_key: idempotencyKey,
        message: 'Click event already recorded, skipping (idempotent)'
      });
      return;
    }
    
    // Record the click event
    await recordClickEvent({
      linkId,
      ipHash,
      idempotencyKey,
      userAgent,
      referrer,
      timestamp
    });
    
    logger.info({
      job_id: job.id,
      link_id: linkId,
      message: 'Click job processed successfully'
    });
    
  } catch (error) {
    logger.error({
      job_id: job.id,
      link_id: linkId,
      error_message: error.message,
      message: 'Failed to process click job'
    });
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Start the worker process
 * @returns {Promise<void>}
 */
async function startWorker() {
  const { processClickJobs } = require('./queue');
  
  logger.info({
    message: 'Worker process started'
  });
  
  // Process jobs continuously
  setInterval(async () => {
    try {
      await processClickJobs(processClickJob);
    } catch (error) {
      logger.error({
        error_message: error.message,
        message: 'Worker processing error'
      });
    }
  }, 1000); // Process every second
}

/**
 * Stop the worker process
 * @returns {Promise<void>}
 */
async function stopWorker() {
  logger.info({
    message: 'Worker process stopped'
  });
  // In production, this would gracefully shut down the worker
}

module.exports = {
  processClickJob,
  startWorker,
  stopWorker
};
