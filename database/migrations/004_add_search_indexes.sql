-- Migration: Add Full-Text Search Indexes for Links
-- Enables efficient text search on URL and description fields

-- Add GIN index for full-text search on url and description
CREATE INDEX IF NOT EXISTS idx_links_fts ON links USING GIN (to_tsvector('english', COALESCE(url, '') || ' ' || COALESCE(description, '')));

-- Add index for tag filtering (if tags are stored as array or JSON)
-- Assuming tags might be stored in a separate table or as JSONB in the future
-- For now, we'll add a composite index for common search patterns

-- Add index for created_at sorting (for pagination by time)
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at DESC);

-- Add index for owner_id scoping (for authentication)
CREATE INDEX IF NOT EXISTS idx_links_owner_id ON links(owner_id);

-- Comment for documentation
COMMENT ON INDEX idx_links_fts IS 'GIN index for full-text search on url and description fields using PostgreSQL FTS';
COMMENT ON INDEX idx_links_created_at IS 'Index for sorting links by creation time (descending)';
COMMENT ON INDEX idx_links_owner_id IS 'Index for scoping search results to authenticated user';
