-- V31: Create boost_pricing_plans table to support dynamic rates, discounts, and taxes per boost option & duration

CREATE TABLE IF NOT EXISTS boost_pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boost_type VARCHAR(30) NOT NULL,
    duration VARCHAR(30) NOT NULL,
    duration_days INT NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_boost_pricing_type_duration UNIQUE (boost_type, duration)
);

CREATE INDEX IF NOT EXISTS idx_boost_pricing_active ON boost_pricing_plans(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_boost_pricing_type ON boost_pricing_plans(boost_type);

-- Seed Initial Boost Pricing Plans with base prices, discount percentages, and tax percentages
INSERT INTO boost_pricing_plans (boost_type, duration, duration_days, base_price, discount_percentage, tax_percentage, is_active, display_order)
VALUES
    -- SPOTLIGHT
    ('SPOTLIGHT', 'THREE_DAYS', 3, 490.00, 0.00, 0.00, TRUE, 1),
    ('SPOTLIGHT', 'SEVEN_DAYS', 7, 890.00, 10.00, 0.00, TRUE, 2),
    ('SPOTLIGHT', 'FOURTEEN_DAYS', 14, 1490.00, 15.00, 0.00, TRUE, 3),
    ('SPOTLIGHT', 'THIRTY_DAYS', 30, 2490.00, 20.00, 0.00, TRUE, 4),

    -- PUSH_UP
    ('PUSH_UP', 'THREE_DAYS', 3, 290.00, 0.00, 0.00, TRUE, 5),
    ('PUSH_UP', 'SEVEN_DAYS', 7, 490.00, 5.00, 0.00, TRUE, 6),
    ('PUSH_UP', 'FOURTEEN_DAYS', 14, 850.00, 10.00, 0.00, TRUE, 7),
    ('PUSH_UP', 'THIRTY_DAYS', 30, 1390.00, 15.00, 0.00, TRUE, 8),

    -- HOT_DEAL
    ('HOT_DEAL', 'THREE_DAYS', 3, 190.00, 0.00, 0.00, TRUE, 9),
    ('HOT_DEAL', 'SEVEN_DAYS', 7, 350.00, 0.00, 0.00, TRUE, 10),
    ('HOT_DEAL', 'FOURTEEN_DAYS', 14, 590.00, 10.00, 0.00, TRUE, 11),
    ('HOT_DEAL', 'THIRTY_DAYS', 30, 990.00, 15.00, 0.00, TRUE, 12),

    -- POWER_PACK (All-in-One Suite)
    ('POWER_PACK', 'THREE_DAYS', 3, 790.00, 10.00, 0.00, TRUE, 13),
    ('POWER_PACK', 'SEVEN_DAYS', 7, 1390.00, 15.00, 0.00, TRUE, 14),
    ('POWER_PACK', 'FOURTEEN_DAYS', 14, 2290.00, 20.00, 0.00, TRUE, 15),
    ('POWER_PACK', 'THIRTY_DAYS', 30, 3890.00, 25.00, 0.00, TRUE, 16)
ON CONFLICT (boost_type, duration) DO NOTHING;
