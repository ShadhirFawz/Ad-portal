-- ==========================================================
-- Shop / business opening hours per user (ISO day: 1=Mon … 7=Sun)
-- Default: weekdays 09:00–17:00, closed on weekends
-- ==========================================================

CREATE TABLE user_opening_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    day_of_week SMALLINT NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    open_time TIME,
    close_time TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_opening_hours_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT uk_user_opening_hours_user_day
        UNIQUE (user_id, day_of_week),
    CONSTRAINT chk_user_opening_hours_day
        CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT chk_user_opening_hours_times
        CHECK (
            (is_closed = TRUE)
            OR (
                is_closed = FALSE
                AND open_time IS NOT NULL
                AND close_time IS NOT NULL
                AND close_time > open_time
            )
        )
);

CREATE INDEX idx_user_opening_hours_user_id ON user_opening_hours(user_id);

INSERT INTO user_opening_hours (user_id, day_of_week, is_closed, open_time, close_time)
SELECT
    u.id,
    d.day,
    CASE WHEN d.day >= 6 THEN TRUE ELSE FALSE END,
    CASE WHEN d.day >= 6 THEN NULL ELSE TIME '09:00' END,
    CASE WHEN d.day >= 6 THEN NULL ELSE TIME '17:00' END
FROM users u
CROSS JOIN generate_series(1, 7) AS d(day);
