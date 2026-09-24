-- V32: Rename HOT_DEAL promotion to URGENT across listings and boost tables

-- 1. Rename is_hot_deal column and update index on listings table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'listings' AND column_name = 'is_hot_deal'
    ) THEN
        ALTER TABLE listings RENAME COLUMN is_hot_deal TO is_urgent;
    END IF;
END $$;

DROP INDEX IF EXISTS idx_listings_is_hot_deal;
CREATE INDEX IF NOT EXISTS idx_listings_is_urgent ON listings(is_urgent) WHERE is_urgent = TRUE;

-- 2. Update existing data in boost tables from HOT_DEAL to URGENT
UPDATE boost_pricing_plans SET boost_type = 'URGENT' WHERE boost_type = 'HOT_DEAL';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ad_boosts') THEN
        UPDATE ad_boosts SET boost_type = 'URGENT' WHERE boost_type = 'HOT_DEAL';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boost_subscriptions') THEN
        UPDATE boost_subscriptions SET boost_type = 'URGENT' WHERE boost_type = 'HOT_DEAL';
    END IF;
END $$;
