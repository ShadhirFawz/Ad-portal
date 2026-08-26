-- ============================================================
-- ALLOW EXTERNAL IMAGE URLS IN LISTING IMAGES
-- ============================================================

ALTER TABLE listing_images
    ALTER COLUMN storage_path TYPE VARCHAR(2000),
    ALTER COLUMN file_size DROP NOT NULL;

ALTER TABLE listing_images
    DROP CONSTRAINT IF EXISTS chk_listing_images_file_size;

ALTER TABLE listing_images
    ADD CONSTRAINT chk_listing_images_file_size
        CHECK (file_size IS NULL OR file_size >= 0);
