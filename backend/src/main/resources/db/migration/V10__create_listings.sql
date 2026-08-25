CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    seller_id UUID NOT NULL,
    category_id UUID NOT NULL,

    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,

    price NUMERIC(14, 2) NOT NULL,

    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',

    condition VARCHAR(30) NOT NULL,

    location VARCHAR(150),

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    view_count BIGINT NOT NULL DEFAULT 0,

    favorite_count BIGINT NOT NULL DEFAULT 0,

    published_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_listings_seller
        FOREIGN KEY (seller_id)
        REFERENCES users(id),

    CONSTRAINT fk_listings_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id),

    CONSTRAINT chk_listing_price
        CHECK (price >= 0),

    CONSTRAINT chk_listing_view_count
        CHECK (view_count >= 0),

    CONSTRAINT chk_listing_favorite_count
        CHECK (favorite_count >= 0)
);

CREATE INDEX idx_listings_seller_id
    ON listings(seller_id);

CREATE INDEX idx_listings_category_id
    ON listings(category_id);

CREATE INDEX idx_listings_status
    ON listings(status);

CREATE INDEX idx_listings_created_at
    ON listings(created_at DESC);

CREATE INDEX idx_listings_published_at
    ON listings(published_at DESC);