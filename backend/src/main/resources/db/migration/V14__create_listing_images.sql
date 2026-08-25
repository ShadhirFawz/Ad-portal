CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    listing_id UUID NOT NULL,

    storage_path VARCHAR(500) NOT NULL,

    file_name VARCHAR(255),

    mime_type VARCHAR(100) NOT NULL,

    file_size BIGINT NOT NULL,

    width INTEGER,

    height INTEGER,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_listing_images_listing
        FOREIGN KEY (listing_id)
        REFERENCES listings(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_listing_images_file_size
        CHECK (file_size > 0),

    CONSTRAINT chk_listing_images_display_order
        CHECK (display_order >= 0)
);

CREATE INDEX idx_listing_images_listing_id
    ON listing_images(listing_id);

CREATE INDEX idx_listing_images_listing_order
    ON listing_images(listing_id, display_order);

CREATE INDEX idx_listing_images_primary
    ON listing_images(listing_id, is_primary);

CREATE UNIQUE INDEX uk_listing_images_storage_path
    ON listing_images(storage_path);

CREATE INDEX idx_listing_images_metadata
    ON listing_images
    USING GIN(metadata);

CREATE UNIQUE INDEX uk_listing_images_one_primary
    ON listing_images(listing_id)
    WHERE is_primary = TRUE;