-- V28: Create boost_subscriptions table for managing ad promotions and scheduled boosts

CREATE TABLE IF NOT EXISTS boost_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    boost_type VARCHAR(30) NOT NULL,
    boost_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    duration_days INT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_boost_subscriptions_listing_id ON boost_subscriptions(listing_id);
CREATE INDEX IF NOT EXISTS idx_boost_subscriptions_user_id ON boost_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_boost_subscriptions_status ON boost_subscriptions(boost_status);
CREATE INDEX IF NOT EXISTS idx_boost_subscriptions_starts_at ON boost_subscriptions(starts_at);
CREATE INDEX IF NOT EXISTS idx_boost_subscriptions_expires_at ON boost_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_boost_subscriptions_active_check ON boost_subscriptions(listing_id, boost_status, expires_at);
