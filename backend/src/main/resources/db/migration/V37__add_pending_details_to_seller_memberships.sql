-- V37: Add pending username and opening hours to seller_memberships, and ensure all root categories have pricing plans

ALTER TABLE seller_memberships
ADD COLUMN IF NOT EXISTS username VARCHAR(30),
ADD COLUMN IF NOT EXISTS opening_hours_json TEXT;

-- Ensure pricing plans exist for all root categories
DO $$
DECLARE
    cat_rec RECORD;
BEGIN
    FOR cat_rec IN 
        SELECT id, name, slug FROM categories WHERE parent_id IS NULL AND active = TRUE
    LOOP
        IF NOT EXISTS (SELECT 1 FROM membership_pricing_plans WHERE root_category_id = cat_rec.id) THEN
            IF cat_rec.name ILIKE '%Vehicle%' OR cat_rec.slug ILIKE '%vehicle%' THEN
                INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
                VALUES
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 4500.00, 25, 3, 4, 2),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 12000.00, 80, 10, 14, 7),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 42000.00, 350, 45, 60, 30),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 8500.00, 60, 6, 8, 4),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 22500.00, 200, 20, 28, 14),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 78000.00, 900, 90, 120, 60)
                ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;
            ELSIF cat_rec.name ILIKE '%Property%' OR cat_rec.name ILIKE '%Real Estate%' OR cat_rec.slug ILIKE '%property%' THEN
                INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
                VALUES
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 5000.00, 20, 4, 4, 2),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 13500.00, 65, 13, 14, 7),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 48000.00, 300, 55, 60, 30),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 9500.00, 50, 8, 8, 5),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 25000.00, 170, 26, 28, 16),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 88000.00, 800, 110, 120, 70)
                ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;
            ELSIF cat_rec.name ILIKE '%Electronic%' OR cat_rec.slug ILIKE '%electronic%' THEN
                INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
                VALUES
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 3000.00, 30, 3, 5, 2),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 8000.00, 100, 10, 17, 7),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 28000.00, 450, 45, 75, 30),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 5500.00, 75, 6, 10, 4),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 14500.00, 250, 20, 35, 14),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 52000.00, 1200, 90, 150, 60)
                ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;
            ELSIF cat_rec.name ILIKE '%Mobile%' OR cat_rec.name ILIKE '%Phone%' OR cat_rec.slug ILIKE '%mobile%' OR cat_rec.slug ILIKE '%phone%' THEN
                INSERT INTO membership_pricing_plans (id, root_category_id, plan_tier, billing_cycle, duration_days, base_price, listing_limit, bonus_spotlight_count, bonus_push_up_count, bonus_urgent_count)
                VALUES
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'MONTHLY', 30, 2800.00, 35, 3, 5, 2),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'QUARTERLY', 90, 7500.00, 115, 10, 17, 7),
                    (gen_random_uuid(), cat_rec.id, 'PRO', 'YEARLY', 365, 26000.00, 500, 45, 75, 30),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'MONTHLY', 30, 5200.00, 85, 6, 10, 4),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'QUARTERLY', 90, 13800.00, 280, 20, 35, 14),
                    (gen_random_uuid(), cat_rec.id, 'PREMIUM', 'YEARLY', 365, 49000.00, 1300, 90, 150, 60)
                ON CONFLICT (root_category_id, plan_tier, billing_cycle) DO NOTHING;
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
        END IF;
    END LOOP;
END $$;
