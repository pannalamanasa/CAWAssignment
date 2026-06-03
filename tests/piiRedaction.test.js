const logger = require('../src/utils/logger');

console.log('=== Test: Recursive PII Redaction Validation ===');

const dangerousInput = {
    request_id: 'req_01',
    metadata: {
        user: {
            email: 'hacker@example.com',
            apiKey: 'lnk_secret123456789'
        },
        history: [
            'Created link from user@domain.com',
            'Authorized via lnk_oldKey'
        ]
    }
};

console.log('Input with nested PII:', JSON.stringify(dangerousInput, null, 2));
console.log('\n--- Logging with redaction ---');
logger.info(dangerousInput);

console.log('\n✓ Test completed - check output above for redaction results');
console.log('Expected: email and apiKey should be [REDACTED]');
console.log('Expected: array strings should have email and API key redacted');
