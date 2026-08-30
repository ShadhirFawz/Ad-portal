-- ==========================================================
-- Create user_phone_numbers table to allow up to 3 phone numbers per user
-- ==========================================================

CREATE TABLE user_phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_phone_numbers_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT uk_user_phone_numbers_user_phone
        UNIQUE (user_id, phone_number)
);

CREATE INDEX idx_user_phone_numbers_user_id ON user_phone_numbers(user_id);
CREATE INDEX idx_user_phone_numbers_phone ON user_phone_numbers(phone_number);

-- Migrate any existing phone numbers from the users table into user_phone_numbers
INSERT INTO user_phone_numbers (user_id, phone_number, is_primary, created_at, updated_at)
SELECT id, phone_number, TRUE, NOW(), NOW()
FROM users
WHERE phone_number IS NOT NULL AND TRIM(phone_number) <> ''
ON CONFLICT (user_id, phone_number) DO NOTHING;
