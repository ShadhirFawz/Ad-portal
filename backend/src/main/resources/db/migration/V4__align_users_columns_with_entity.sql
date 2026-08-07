-- Align users table column names and fields with the User JPA entity

ALTER TABLE users
    RENAME COLUMN profile_image_url TO avatar_url;

ALTER TABLE users
    RENAME COLUMN cover_image_url TO cover_photo_url;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
