const { hashApiKey } = require('../utils/crypto');

/**
 * API Key Authentication Middleware
 * Validates X-API-Key header against database and attaches owner context
 * 
 * Expected header format: X-API-Key: lnk_keyId_actualSecretKey
 */
async function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API key' });
    }

    try {
        // Extract key_id from the API key (format: lnk_keyId_secret)
        const parts = apiKey.split('_');
        if (parts.length < 3) {
            return res.status(401).json({ error: 'Invalid API key format' });
        }

        const keyId = `${parts[0]}_${parts[1]}`; // lnk_keyId part

        // Query database for the API key using key_id
        const result = await req.pool.query(
            'SELECT id, owner_id, status, salt, hashed_key FROM api_keys WHERE key_id = $1',
            [keyId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        const keyRecord = result.rows[0];

        // Verify the key is active
        if (keyRecord.status !== 'active') {
            return res.status(401).json({ error: 'API key has been revoked' });
        }

        // Hash the incoming key with the stored salt and compare
        const incomingHash = hashApiKey(apiKey, keyRecord.salt);
        if (incomingHash !== keyRecord.hashed_key) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        // Attach owner context to request
        req.apiKey = {
            id: keyRecord.id,
            ownerId: keyRecord.owner_id
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error' });
    }
}

module.exports = { apiKeyAuth };
