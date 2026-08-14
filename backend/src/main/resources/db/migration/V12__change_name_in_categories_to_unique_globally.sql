ALTER TABLE categories
    DROP CONSTRAINT IF EXISTS uk_categories_name;

CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_name_per_parent
    ON categories (
        COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid),
        LOWER(name)
    );