const redis = require('redis');

// Rate limit matrix (will be configurable via environment variables)
const RATE_LIMITS = {
    public: {
        requestsPerMinute: 100
    },
    protected: {
        requestsPerMinute: 10
    }
};

// Redis client (will be initialized with connection from environment)
let redisClient;

/**
 * Initialize Redis client
 */
function initRedis() {
    if (!redisClient) {
        redisClient = redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        });
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
    }
    return redisClient;
}

/**
 * Rate limiting middleware using fixed-window counter
 * @param {string} type - 'public' or 'protected'
 */
async function rateLimit(type = 'public') {
    return async (req, res, next) => {
        try {
            const client = initRedis();
            const limit = RATE_LIMITS[type].requestsPerMinute;
            
            // Determine identifier (IP for public, API key for protected)
            let identifier;
            if (type === 'protected' && req.apiKey) {
                identifier = `apikey:${req.apiKey.id}`;
            } else {
                identifier = `ip:${req.ip}`;
            }

            // Create Redis key with current minute timestamp
            const now = Date.now();
            const minute = Math.floor(now / 60000); // Current minute
            const redisKey = `ratelimit:${identifier}:${minute}`;

            // Increment counter
            const current = await client.incr(redisKey);

            // Set expiration on first request
            if (current === 1) {
                await client.expire(redisKey, 60);
            }

            // Check if limit exceeded
            if (current > limit) {
                return res.status(429).json({ 
                    error: 'Too many requests',
                    limit: limit,
                    reset: (minute + 1) * 60000
                });
            }

            // Add rate limit headers
            res.setHeader('X-RateLimit-Limit', limit);
            res.setHeader('X-RateLimit-Remaining', limit - current);
            res.setHeader('X-RateLimit-Reset', (minute + 1) * 60000);

            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            // Fail open - allow request if Redis is down
            next();
        }
    };
}

module.exports = {
    rateLimit,
    initRedis,
    RATE_LIMITS
};
