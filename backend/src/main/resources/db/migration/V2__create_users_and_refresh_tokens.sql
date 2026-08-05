-- ==========================================================
-- Enable UUID generation
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================
-- USERS
-- ==========================================================

CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    username VARCHAR(50),

    phone_number VARCHAR(20),

    profile_image_url TEXT,

    cover_image_url TEXT,

    bio TEXT,

    role VARCHAR(20) NOT NULL,

    status VARCHAR(40) NOT NULL,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);

-- ==========================================================
-- UNIQUE CONSTRAINTS
-- ==========================================================

ALTER TABLE users
ADD CONSTRAINT uk_users_username UNIQUE(username);

ALTER TABLE users
ADD CONSTRAINT uk_users_phone UNIQUE(phone_number);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_status
ON users(status);

CREATE INDEX idx_users_role
ON users(role);

CREATE INDEX idx_users_created_at
ON users(created_at DESC);

-- ==========================================================
-- REFRESH TOKENS
-- ==========================================================

CREATE TABLE refresh_tokens
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ==========================================================
-- INDEXES
-- ==========================================================

CREATE INDEX idx_refresh_user
ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_token
ON refresh_tokens(token);

CREATE INDEX idx_refresh_expiry
ON refresh_tokens(expires_at);