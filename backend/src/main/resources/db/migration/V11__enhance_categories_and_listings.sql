-- ============================================================
-- CATEGORY ENHANCEMENTS
-- ============================================================

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS allow_listings BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Existing "active" remains the public availability flag.

UPDATE categories
SET code = UPPER(
    REGEXP_REPLACE(
        slug,
        '[^a-zA-Z0-9]+',
        '_',
        'g'
    )
)
WHERE code IS NULL;

ALTER TABLE categories
    ALTER COLUMN code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_code
    ON categories(code);

CREATE INDEX IF NOT EXISTS idx_categories_parent_active
    ON categories(parent_id, active);

CREATE INDEX IF NOT EXISTS idx_categories_allow_listings
    ON categories(allow_listings);

CREATE INDEX IF NOT EXISTS idx_categories_level
    ON categories(level);


-- ============================================================
-- LISTING ENUM-LIKE VALUES
-- ============================================================

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS listing_type VARCHAR(30)
        NOT NULL DEFAULT 'ITEM',

    ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(30)
        NOT NULL DEFAULT 'FIXED',

    ADD COLUMN IF NOT EXISTS negotiable BOOLEAN
        NOT NULL DEFAULT FALSE,

    ADD COLUMN IF NOT EXISTS minimum_offer_price NUMERIC(14, 2),

    ADD COLUMN IF NOT EXISTS quantity INTEGER
        NOT NULL DEFAULT 1,

    ADD COLUMN IF NOT EXISTS available_quantity INTEGER
        NOT NULL DEFAULT 1,

    ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER
        NOT NULL DEFAULT 0,

    ADD COLUMN IF NOT EXISTS location_type VARCHAR(30)
        NOT NULL DEFAULT 'CITY',

    ADD COLUMN IF NOT EXISTS district VARCHAR(100),

    ADD COLUMN IF NOT EXISTS province VARCHAR(100),

    ADD COLUMN IF NOT EXISTS city VARCHAR(100),

    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),

    ADD COLUMN IF NOT EXISTS custom_attributes JSONB
        NOT NULL DEFAULT '{}'::jsonb,

    ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(30)
        NOT NULL DEFAULT 'NOT_REQUIRED',

    ADD COLUMN IF NOT EXISTS moderation_reason VARCHAR(1000),

    ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(1000),

    ADD COLUMN IF NOT EXISTS published_by UUID,

    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,

    ADD COLUMN IF NOT EXISTS deleted_by UUID,

    ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(500),

    ADD COLUMN IF NOT EXISTS last_published_at TIMESTAMPTZ,

    ADD COLUMN IF NOT EXISTS updated_by UUID;


-- ============================================================
-- LISTING CONSTRAINTS
-- ============================================================

ALTER TABLE listings
    ADD CONSTRAINT chk_listings_quantity
        CHECK (quantity > 0),

    ADD CONSTRAINT chk_listings_available_quantity
        CHECK (
            available_quantity >= 0
            AND available_quantity <= quantity
        ),

    ADD CONSTRAINT chk_listings_reserved_quantity
        CHECK (
            reserved_quantity >= 0
            AND reserved_quantity <= quantity
        ),

    ADD CONSTRAINT chk_listings_price
        CHECK (price >= 0),

    ADD CONSTRAINT chk_listings_minimum_offer_price
        CHECK (
            minimum_offer_price IS NULL
            OR minimum_offer_price >= 0
        );


-- ============================================================
-- LISTING INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_listings_public_feed
    ON listings(status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_seller_status
    ON listings(seller_id, status);

CREATE INDEX IF NOT EXISTS idx_listings_category_status
    ON listings(category_id, status);

CREATE INDEX IF NOT EXISTS idx_listings_city_status
    ON listings(city, status);

CREATE INDEX IF NOT EXISTS idx_listings_district_status
    ON listings(district, status);

CREATE INDEX IF NOT EXISTS idx_listings_moderation_status
    ON listings(moderation_status);

CREATE INDEX IF NOT EXISTS idx_listings_deleted_at
    ON listings(deleted_at);


-- ============================================================
-- JSONB INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_listings_custom_attributes
    ON listings
    USING GIN (custom_attributes);


-- ============================================================
-- FOREIGN KEYS FOR AUDIT USERS
-- ============================================================

ALTER TABLE listings
    ADD CONSTRAINT fk_listings_published_by
        FOREIGN KEY (published_by)
        REFERENCES users(id),

    ADD CONSTRAINT fk_listings_deleted_by
        FOREIGN KEY (deleted_by)
        REFERENCES users(id),

    ADD CONSTRAINT fk_listings_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id);


-- ============================================================
-- CATEGORY PARENT VALIDATION
-- ============================================================

ALTER TABLE categories
    ADD CONSTRAINT chk_categories_not_own_parent
        CHECK (
            parent_id IS NULL
            OR parent_id <> id
        );