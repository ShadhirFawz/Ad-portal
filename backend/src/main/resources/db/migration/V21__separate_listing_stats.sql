CREATE TABLE IF NOT EXISTS listing_stats (
    listing_id UUID PRIMARY KEY,
    view_count BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_listing_stats_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_listing_stats_view_count
        CHECK (view_count >= 0)
);

-- Populate listing_stats with view counts for any existing listings
INSERT INTO listing_stats (listing_id, view_count)
SELECT id, COALESCE(view_count, 0)
FROM listings
ON CONFLICT (listing_id) DO NOTHING;

-- Populate listing_favorites for any existing data if needed
-- Drop view_count and favorite_count from listings table
ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listing_view_count;
ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listing_favorite_count;
ALTER TABLE listings DROP COLUMN IF EXISTS view_count;
ALTER TABLE listings DROP COLUMN IF EXISTS favorite_count;
