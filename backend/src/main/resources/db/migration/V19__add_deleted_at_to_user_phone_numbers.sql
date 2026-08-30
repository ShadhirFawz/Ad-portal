-- ==========================================================
-- Add deleted_at column to user_phone_numbers table
-- ==========================================================

ALTER TABLE user_phone_numbers
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
