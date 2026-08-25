-- First, drop the conflicting unique constraint from V8
ALTER TABLE categories DROP CONSTRAINT IF EXISTS uk_categories_name;

-- Drop redundant index
DROP INDEX IF EXISTS idx_categories_allow_listings;