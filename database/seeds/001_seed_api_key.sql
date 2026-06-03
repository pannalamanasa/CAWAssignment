-- Seed script: Create a test API key for development/testing
-- This creates a single API key that can be used for testing authentication

-- Generate a test API key (this would normally be done by the application)
-- For this seed, we'll use a known test key: lnk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
-- key_id: lnk_test
-- hashed_key: (will be computed)
-- salt: (will be generated)

-- Insert test API key
-- Note: In production, this would be done through an admin interface
INSERT INTO api_keys (key_id, hashed_key, salt, owner_id, status)
VALUES (
    'lnk_test',
    '5f4dcc3b5aa765d61d8327deb882cf99', -- This is a placeholder hash
    'test_salt_12345678', -- This is a placeholder salt
    '00000000-0000-0000-0000-000000000001', -- Test owner ID
    'active'
)
ON CONFLICT (key_id) DO NOTHING;
