-- ==========================================================
-- Update Role Enum from USER to MEMBER / SELLER / ADMIN
-- Ensure account status consistency
-- ==========================================================

-- Migrate any existing USER roles to MEMBER
UPDATE users
SET role = 'MEMBER'
WHERE role = 'USER' OR role IS NULL;

-- Set default role to MEMBER
ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'MEMBER';

-- Ensure status has default ACTIVE and no nulls
UPDATE users
SET status = 'ACTIVE'
WHERE status IS NULL;

ALTER TABLE users
ALTER COLUMN status SET DEFAULT 'ACTIVE';
