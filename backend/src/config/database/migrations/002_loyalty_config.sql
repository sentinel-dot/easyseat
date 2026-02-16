-- Migration: Loyalty points configuration (single row in DB)
-- Run on existing DB to persist admin-editable bonus points settings.

CREATE TABLE IF NOT EXISTS loyalty_config (
    id INT PRIMARY KEY DEFAULT 1,
    booking_completed INT NOT NULL DEFAULT 10,
    booking_with_review INT NOT NULL DEFAULT 5,
    welcome_bonus INT NOT NULL DEFAULT 50,
    email_verified_bonus INT NOT NULL DEFAULT 25,
    points_per_euro DECIMAL(5,2) NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_single_row CHECK (id = 1)
);

-- Insert default row if table is empty (no SELECT/condition in plain SQL, so we rely on application to seed on first load if needed)
INSERT IGNORE INTO loyalty_config (id, booking_completed, booking_with_review, welcome_bonus, email_verified_bonus, points_per_euro)
VALUES (1, 10, 5, 50, 25, 1);
