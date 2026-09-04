-- Ensure only one auction overall is allowed per listing (active or closed)
DROP INDEX IF EXISTS uq_auctions_active_per_listing;
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS uq_auctions_listing_id;
ALTER TABLE auctions ADD CONSTRAINT uq_auctions_listing_id UNIQUE (listing_id);

-- Ensure only one active auction is allowed per seller at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_auctions_one_active_per_seller
    ON auctions (seller_id)
    WHERE status = 'ACTIVE';
