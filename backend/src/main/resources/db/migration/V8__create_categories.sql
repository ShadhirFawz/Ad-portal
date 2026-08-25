CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,

    description VARCHAR(500),

    parent_id UUID,

    icon_url TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories(id),

    CONSTRAINT uk_categories_name
        UNIQUE (name),

    CONSTRAINT uk_categories_slug
        UNIQUE (slug)
);

CREATE INDEX idx_categories_parent_id
    ON categories(parent_id);

CREATE INDEX idx_categories_active
    ON categories(active);

CREATE INDEX idx_categories_display_order
    ON categories(display_order);