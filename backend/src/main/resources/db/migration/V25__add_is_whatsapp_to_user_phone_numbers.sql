-- ==========================================================
-- Add is_whatsapp column to user_phone_numbers table
-- ==========================================================

ALTER TABLE user_phone_numbers
    ADD COLUMN IF NOT EXISTS is_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_is_whatsapp
    ON user_phone_numbers(user_id, is_whatsapp);
