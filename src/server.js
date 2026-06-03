/**
 * Server with health and readiness checks
 * Binds to 0.0.0.0 with configurable PORT
 * Implements graceful shutdown
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

let server;
let isShuttingDown = false;

// Mock database connection status
let dbConnected = true;

// Health check endpoint - always returns 200 if server is running
function healthCheck(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
}

// Readiness check endpoint - returns 200 only if dependencies are ready
function readinessCheck(req, res) {
  if (isShuttingDown) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'shutting_down', timestamp: new Date().toISOString() }));
    return;
  }
  
  if (!dbConnected) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not_ready', reason: 'database_not_connected', timestamp: new Date().toISOString() }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ready', timestamp: new Date().toISOString() }));
}

// Request handler
function handleRequest(req, res) {
  if (req.url === '/health' && req.method === 'GET') {
    healthCheck(req, res);
  } else if (req.url === '/ready' && req.method === 'GET') {
    readinessCheck(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found', timestamp: new Date().toISOString() }));
  }
}

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`Received ${signal}, starting graceful shutdown...`);
  isShuttingDown = true;
  
  // Stop accepting new connections
  server.close(() => {
    console.log('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Create and start server
server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/health`);
  console.log(`Readiness check: http://${HOST}:${PORT}/ready`);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
