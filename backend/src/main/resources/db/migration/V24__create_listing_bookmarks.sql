CREATE TABLE listing_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    listing_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_listing_bookmarks_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_listing_bookmarks_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_listing_bookmarks_user_listing
        UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_listing_bookmarks_user_id
    ON listing_bookmarks(user_id);

CREATE INDEX idx_listing_bookmarks_listing_id
    ON listing_bookmarks(listing_id);
