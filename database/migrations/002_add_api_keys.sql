-- Migration: Add API Keys Table for Authentication
-- This migration adds secure API key storage with salted hashing

-- -----------------------------------------------------------------------------
-- Table: api_keys
-- Description: Secure storage for API keys with salted hashing for authentication.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(16) NOT NULL UNIQUE,
    hashed_key VARCHAR(64) NOT NULL UNIQUE,
    salt VARCHAR(32) NOT NULL,
    owner_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index: API Key Lookup Optimization
-- Rationale: Fast O(1) lookup for authentication middleware validation.
CREATE INDEX IF NOT EXISTS idx_api_keys_key_id 
ON api_keys(key_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_hashed 
ON api_keys(hashed_key);
