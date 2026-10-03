-- =========================================================================
-- V35: Introduce VERIFIED_SELLER Memberships, Business Metadata & Seed Plans
-- =========================================================================

-- 1. Extend user phone numbers with is_business flag
ALTER TABLE user_phone_numbers 
ADD COLUMN IF NOT EXISTS is_business BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add business metadata columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);

-- 3. Create Membership Pricing Plans table (Dynamic pricing & bonus boosts per root category)
CREATE TABLE IF NOT EXISTS membership_pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    root_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    plan_tier VARCHAR(30) NOT NULL,            -- 'PRO', 'PREMIUM'
    billing_cycle VARCHAR(30) NOT NULL,        -- 'MONTHLY', 'QUARTERLY', 'YEARLY'
    duration_days INT NOT NULL,                -- 30, 90, 365
    base_price NUMERIC(10, 2) NOT NULL,
    listing_limit INT NOT NULL,                -- e.g. 25, 80, 350 for Pro; 60, 200, 900 for Premium
    bonus_spotlight_count INT NOT NULL DEFAULT 0,
    bonus_push_up_count INT NOT NULL DEFAULT 0,
    bonus_urgent_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_membership_plan_category_tier_cycle UNIQUE (root_category_id, plan_tier, billing_cycle)
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_category ON membership_pricing_plans(root_category_id, is_active);

-- 4. Create Seller Memberships Subscription Table
CREATE TABLE IF NOT EXISTS seller_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    root_category_id UUID NOT NULL REFERENCES categories(id),
    pricing_plan_id UUID NOT NULL REFERENCES membership_pricing_plans(id),
    plan_tier VARCHAR(30) NOT NULL,
    billing_cycle VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT', -- 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Listing Quota Tracking
    listing_limit INT NOT NULL,
    listings_used INT NOT NULL DEFAULT 0,
    
    -- Bonus Boost Credits Balances (Total credited and used)
    spotlight_credits_total INT NOT NULL DEFAULT 0,
    spotlight_credits_used INT NOT NULL DEFAULT 0,
    push_up_credits_total INT NOT NULL DEFAULT 0,
    push_up_credits_used INT NOT NULL DEFAULT 0,
    urgent_credits_total INT NOT NULL DEFAULT 0,
    urgent_credits_used INT NOT NULL DEFAULT 0,
    
    -- Business Information
    business_name VARCHAR(200) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    business_phone VARCHAR(30) NOT NULL,
    bio TEXT,
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_memberships_user_status ON seller_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_seller_memberships_category ON seller_memberships(root_category_id);

-- =========================================================================
-- 5. Initial Seed Data for All 14 Root Categories (Pro & Premium Plans)
-- =========================================================================

DO $$
DECLARE
    cat_rec RECORD;
BEGIN
    FOR cat_rec IN 
        SELECT id, name FROM categories WHERE parent_id IS NULL AND active = TRUE
    LOOP
        -- 1. VEHICLES
        IF cat_rec.name ILIKE '%Vehicle%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 4500.00, 25, 3, 4, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 12000.00, 80, 10, 14, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 42000.00, 350, 45, 60, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 8500.00, 60, 6, 8, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 22500.00, 200, 20, 28, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 78000.00, 900, 90, 120, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 2. PROPERTY / REAL ESTATE
        ELSIF cat_rec.name ILIKE '%Property%' OR cat_rec.name ILIKE '%Real Estate%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 5000.00, 20, 4, 4, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 13500.00, 65, 13, 14, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 48000.00, 300, 55, 60, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 9500.00, 50, 8, 8, 5),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 25000.00, 170, 26, 28, 16),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 88000.00, 800, 110, 120, 70)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 3. ELECTRONICS
        ELSIF cat_rec.name ILIKE '%Electronic%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 3000.00, 30, 3, 5, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 8000.00, 100, 10, 17, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 28000.00, 450, 45, 75, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 5500.00, 75, 6, 10, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 14500.00, 250, 20, 35, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 52000.00, 1200, 90, 150, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 4. MOBILES
        ELSIF cat_rec.name ILIKE '%Mobile%' OR cat_rec.name ILIKE '%Phone%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2800.00, 35, 3, 5, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 7500.00, 115, 10, 17, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 26000.00, 500, 45, 75, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 5200.00, 85, 6, 10, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 13800.00, 280, 20, 35, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 49000.00, 1300, 90, 150, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 5. BUSINESS & INDUSTRY
        ELSIF cat_rec.name ILIKE '%Business%' OR cat_rec.name ILIKE '%Industry%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 3800.00, 25, 3, 4, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 10000.00, 80, 10, 14, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 35000.00, 350, 45, 60, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 7000.00, 60, 6, 8, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 18500.00, 200, 20, 28, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 65000.00, 900, 90, 120, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 6. HOME & GARDEN
        ELSIF cat_rec.name ILIKE '%Home%' OR cat_rec.name ILIKE '%Garden%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2200.00, 35, 2, 4, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 5800.00, 115, 7, 14, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 20500.00, 500, 30, 60, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 4200.00, 80, 5, 8, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 11200.00, 260, 16, 28, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 39500.00, 1200, 75, 120, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 7. FASHION & BEAUTY
        ELSIF cat_rec.name ILIKE '%Fashion%' OR cat_rec.name ILIKE '%Beauty%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2000.00, 40, 2, 5, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 5400.00, 130, 7, 17, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 19000.00, 600, 30, 75, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 3800.00, 90, 5, 10, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 10000.00, 300, 16, 35, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 36000.00, 1400, 75, 150, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 8. SERVICES
        ELSIF cat_rec.name ILIKE '%Service%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2200.00, 20, 3, 3, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 5800.00, 65, 10, 10, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 20500.00, 300, 45, 45, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 4200.00, 50, 6, 7, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 11200.00, 170, 20, 24, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 39500.00, 800, 90, 105, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 9. EDUCATION
        ELSIF cat_rec.name ILIKE '%Education%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 1800.00, 20, 2, 3, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 4800.00, 65, 7, 10, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 17000.00, 300, 30, 45, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 3500.00, 50, 5, 6, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 9200.00, 170, 16, 20, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 33000.00, 800, 75, 90, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 10. HOBBY, SPORT & KIDS
        ELSIF cat_rec.name ILIKE '%Hobby%' OR cat_rec.name ILIKE '%Sport%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 1900.00, 35, 2, 4, 1),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 5000.00, 115, 7, 14, 4),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 18000.00, 500, 30, 60, 18),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 3600.00, 80, 5, 8, 3),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 9600.00, 260, 16, 28, 10),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 34000.00, 1200, 75, 120, 45)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 11. ANIMALS
        ELSIF cat_rec.name ILIKE '%Animal%' OR cat_rec.name ILIKE '%Pet%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2200.00, 25, 2, 3, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 5800.00, 80, 7, 10, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 20500.00, 350, 30, 45, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 4200.00, 60, 5, 7, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 11200.00, 200, 16, 24, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 39500.00, 900, 75, 105, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 12. AGRICULTURE
        ELSIF cat_rec.name ILIKE '%Agri%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2000.00, 30, 2, 4, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 5400.00, 100, 7, 14, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 19000.00, 450, 30, 60, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 3800.00, 75, 5, 8, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 10000.00, 250, 16, 28, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 36000.00, 1200, 75, 120, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 13. ESSENTIALS
        ELSIF cat_rec.name ILIKE '%Essential%' THEN
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 1800.00, 40, 2, 4, 2),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 4800.00, 130, 7, 14, 7),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 17000.00, 600, 30, 60, 30),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 3500.00, 90, 5, 8, 4),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 9200.00, 300, 16, 28, 14),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 33000.00, 1400, 75, 120, 60)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;

        -- 14. DEFAULT / OTHER
        ELSE
            INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
            VALUES
                (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 1800.00, 30, 2, 3, 1),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 4800.00, 100, 7, 10, 4),
                (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 17000.00, 450, 30, 45, 18),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 3500.00, 75, 5, 7, 3),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 9200.00, 250, 16, 24, 10),
                (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 33000.00, 1200, 75, 105, 45)
            ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;
        END IF;
    END LOOP;
END $$;
