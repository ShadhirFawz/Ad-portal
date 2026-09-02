CREATE TABLE listing_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    listing_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_listing_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_listing_favorites_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_listing_favorites_user_listing
        UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_listing_favorites_user_id
    ON listing_favorites(user_id);

CREATE INDEX idx_listing_favorites_listing_id
    ON listing_favorites(listing_id);
