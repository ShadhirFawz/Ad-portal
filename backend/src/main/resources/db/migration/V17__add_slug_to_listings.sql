-- Add slug column to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug VARCHAR(180);

-- Populate slug for existing listings
UPDATE listings
SET slug = CONCAT(
    SUBSTRING(
        TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(title), '[^a-z0-9]+', '-', 'g')),
        1, 140
    ),
    '-',
    SUBSTRING(id::text, 1, 8)
)
WHERE slug IS NULL OR slug = '';

-- Fallback for empty/special character titles
UPDATE listings
SET slug = CONCAT('listing-', SUBSTRING(id::text, 1, 8))
WHERE slug IS NULL OR slug = '' OR slug = '-';

-- Make slug non-null and unique
ALTER TABLE listings ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_listings_slug ON listings(slug);
