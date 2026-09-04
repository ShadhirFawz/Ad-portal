CREATE TABLE auctions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    seller_id   UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE', 'CLOSED')),
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at     TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_auctions_active_per_listing
    ON auctions (listing_id)
    WHERE status = 'ACTIVE';

CREATE INDEX idx_auctions_listing_id ON auctions (listing_id);
CREATE INDEX idx_auctions_seller_id ON auctions (seller_id);
CREATE INDEX idx_auctions_status ON auctions (status);

CREATE TABLE auction_bids (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id   UUID NOT NULL REFERENCES users(id),
    amount      NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    placed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_winning  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_auction_bids_auction_id ON auction_bids (auction_id);
CREATE INDEX idx_auction_bids_bidder_id ON auction_bids (bidder_id);
CREATE INDEX idx_auction_bids_amount ON auction_bids (auction_id, amount DESC);
