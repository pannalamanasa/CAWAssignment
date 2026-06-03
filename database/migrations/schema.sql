-- Up Migration: Initialize URL Shortener Core Persistence Schema

-- Enable UUID extension if UUIDs are used for click event identification
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Table: links
-- Description: Core source of truth for active and soft-deleted short links.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS links (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(12) NOT NULL,
    destination_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Index 1: Partial Unique Index for Fast Public Redirections
-- Rationale: Guarantees lightning-fast O(1) lookups and enforces string uniqueness 
-- exclusively for active codes. This allows deleted short_codes to be safely re-created.
CREATE UNIQUE INDEX idx_links_active_code 
ON links (short_code) 
WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- Table: click_events
-- Description: High-volume, append-only analytical stream tracking link clicks.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS click_events (
    click_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id BIGINT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_click_events_link_id 
        FOREIGN KEY (link_id) 
        REFERENCES links(id) 
        ON DELETE CASCADE
);

-- Index 2: Foreign Key Analytics Optimization Index
-- Rationale: Eliminates costly sequential table scans or row locks when running 
-- background worker aggregation queries or reporting metrics per link lifecycle.
CREATE INDEX idx_click_events_link_id 
ON click_events (link_id);
