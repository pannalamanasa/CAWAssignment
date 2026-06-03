const crypto = require('crypto');

/**
 * Generates a unique key_id for efficient database lookup.
 * Example output: lnk_abc123xyz
 */
function generateKeyId() {
    const rawId = crypto.randomBytes(6).toString('hex').substring(0, 8);
    const prefix = 'lnk';
    return `${prefix}_${rawId}`;
}

/**
 * Generates a clean, readable API key prefix and secret string.
 * Example output: lnk_rawKeyStringHere
 */
function generateApiKey() {
    const rawKey = crypto.randomBytes(24).toString('hex');
    const prefix = 'lnk';
    return `${prefix}_${rawKey}`;
}

/**
 * Hashes a plain text API key using a unique salt.
 * @param {string} apiKey 
 * @param {string} salt 
 */
function hashApiKey(apiKey, salt) {
    return crypto
        .createHmac('sha256', salt)
        .update(apiKey)
        .digest('hex');
}

/**
 * Creates a unique salt and hashes the new API key.
 */
function createSecureKeyRecords(apiKey) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedKey = hashApiKey(apiKey, salt);
    const keyId = generateKeyId();
    return { keyId, hashedKey, salt };
}

module.exports = {
    generateKeyId,
    generateApiKey,
    hashApiKey,
    createSecureKeyRecords
};
