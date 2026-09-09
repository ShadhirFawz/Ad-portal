-- ==========================================================
-- Add sold_at column to listings table
-- ==========================================================

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_listings_sold_at
    ON listings (sold_at DESC);
