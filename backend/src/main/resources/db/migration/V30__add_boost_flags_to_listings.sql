-- V30: Add boost status flags to listings table for efficient sorting & badging

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_hot_deal BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_pushed_up BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS push_up_last_bumped_at TIMESTAMPTZ;

-- Indexes for boosted queries and sorting
CREATE INDEX IF NOT EXISTS idx_listings_is_spotlight ON listings(is_spotlight) WHERE is_spotlight = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_is_hot_deal ON listings(is_hot_deal) WHERE is_hot_deal = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_is_pushed_up ON listings(is_pushed_up, push_up_last_bumped_at DESC) WHERE is_pushed_up = TRUE;
