-- V29: Create boost_payments table for tracking PayHere transactions

CREATE TABLE IF NOT EXISTS boost_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boost_subscription_id UUID NOT NULL REFERENCES boost_subscriptions(id) ON DELETE CASCADE,
    payhere_order_id VARCHAR(100) NOT NULL UNIQUE,
    payhere_payment_id VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'LKR',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payhere_raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lookup and webhook processing
CREATE INDEX IF NOT EXISTS idx_boost_payments_subscription_id ON boost_payments(boost_subscription_id);
CREATE INDEX IF NOT EXISTS idx_boost_payments_order_id ON boost_payments(payhere_order_id);
CREATE INDEX IF NOT EXISTS idx_boost_payments_status ON boost_payments(payment_status);
