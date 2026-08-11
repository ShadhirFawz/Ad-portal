-- ==========================================================
-- Add location column to users table
-- ==========================================================

ALTER TABLE users
ADD COLUMN location VARCHAR(255);
