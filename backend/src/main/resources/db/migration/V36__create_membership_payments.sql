-- V36: Create membership_payments table for tracking PayHere transactions for Verified Seller memberships

CREATE TABLE IF NOT EXISTS membership_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_membership_id UUID NOT NULL REFERENCES seller_memberships(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_membership_payments_membership_id ON membership_payments(seller_membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_order_id ON membership_payments(payhere_order_id);
CREATE INDEX IF NOT EXISTS idx_membership_payments_status ON membership_payments(payment_status);
