-- Migration: Customer accounts (run on existing DBs that already have bookings/users)
-- Run this only if you have an existing easyseatdb without the customer tables.

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    loyalty_points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token)
);

-- 2. Add customer_id to bookings (skip this block if you already have customer_id from a full schema)
ALTER TABLE bookings ADD COLUMN customer_id INT NULL AFTER id;
ALTER TABLE bookings ADD INDEX idx_customer_id (customer_id);
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- 3. Customer preferences
CREATE TABLE IF NOT EXISTS customer_preferences (
    customer_id INT PRIMARY KEY,
    default_party_size INT DEFAULT 2,
    preferred_time_slot VARCHAR(50),
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'de',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. Customer favorites
CREATE TABLE IF NOT EXISTS customer_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    venue_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_venue (customer_id, venue_id),
    INDEX idx_customer (customer_id),
    INDEX idx_venue (venue_id)
);

-- 5. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    venue_id INT NOT NULL,
    booking_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    response TEXT,
    response_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_booking (customer_id, booking_id),
    INDEX idx_venue (venue_id),
    INDEX idx_customer (customer_id),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
);

-- 6. Loyalty transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    booking_id INT,
    points INT NOT NULL,
    type ENUM('earned', 'redeemed', 'expired', 'bonus') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_customer (customer_id),
    INDEX idx_type (type)
);
