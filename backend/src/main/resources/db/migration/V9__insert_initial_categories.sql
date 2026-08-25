CREATE TABLE IF NOT EXISTS public.categories (
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
        REFERENCES public.categories(id),

    CONSTRAINT uk_categories_name
        UNIQUE (name),

    CONSTRAINT uk_categories_slug
        UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
    ON public.categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_active
    ON public.categories(active);

CREATE INDEX IF NOT EXISTS idx_categories_display_order
    ON public.categories(display_order);

INSERT INTO public.categories (
    name,
    slug,
    description,
    display_order,
    active
)
VALUES
(
    'Vehicles',
    'vehicles',
    'Cars, motorcycles, vans and other vehicles',
    1,
    TRUE
),
(
    'Electronics',
    'electronics',
    'Phones, computers, accessories and electronics',
    2,
    TRUE
),
(
    'Fashion',
    'fashion',
    'Clothing, shoes and fashion accessories',
    3,
    TRUE
),
(
    'Home & Garden',
    'home-garden',
    'Furniture, appliances, garden and household items',
    4,
    TRUE
),
(
    'Sports & Hobbies',
    'sports-hobbies',
    'Sports equipment, games and hobby items',
    5,
    TRUE
),
(
    'Books & Media',
    'books-media',
    'Books, movies, music and other media',
    6,
    TRUE
),
(
    'Services',
    'services',
    'Services offered by users',
    7,
    TRUE
),
(
    'Other',
    'other',
    'Other items that do not fit another category',
    8,
    TRUE
)
ON CONFLICT DO NOTHING;