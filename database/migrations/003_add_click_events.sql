-- Migration: Add click_events table for analytics
-- This table stores click event data for link analytics
-- Retention: 30 days (configurable)

CREATE TABLE IF NOT EXISTS click_events (
    id BIGSERIAL PRIMARY KEY,
    link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    referrer TEXT,
    ip_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of IP address for privacy
    idempotency_key VARCHAR(255) UNIQUE NOT NULL, -- Prevents duplicate click recording
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient analytics queries by link and time range
CREATE INDEX IF NOT EXISTS idx_click_events_link_id_clicked_at ON click_events(link_id, clicked_at DESC);

-- Index for retention cleanup by clicked_at
CREATE INDEX IF NOT EXISTS idx_click_events_clicked_at ON click_events(clicked_at);

-- Index for idempotency lookups
CREATE INDEX IF NOT EXISTS idx_click_events_idempotency_key ON click_events(idempotency_key);

-- Comment for documentation
COMMENT ON TABLE click_events IS 'Stores click event data for link analytics with 30-day retention';
COMMENT ON COLUMN click_events.ip_hash IS 'SHA-256 hash of IP address for privacy compliance';
COMMENT ON COLUMN click_events.idempotency_key IS 'Unique key to prevent duplicate click recording from retries';
