-- ==========================================================
-- Add street_number column to listings table
-- ==========================================================

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS street_number VARCHAR(100);
