-- Database schema

-- Create database
CREATE DATABASE IF NOT EXISTS easyseatdb;
USE easyseatdb;



-- venue table
CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('restaurant', 'hair_salon', 'beauty_salon', 'massage', 'other') NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(255),
    postal_code VARCHAR(20),
    country VARCHAR(3) DEFAULT 'DE',
    description TEXT,
    image_url VARCHAR(500),
    website_url VARCHAR(500),
    booking_advance_days INT DEFAULT 30,
    cancellation_hours INT DEFAULT 24,
    require_phone BOOLEAN DEFAULT FALSE,
    require_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Staff members table
CREATE TABLE staff_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    price DECIMAL(10, 2),
    capacity INT DEFAULT 1,
    requires_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- Staff services junction table
CREATE TABLE staff_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_member_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_staff_service (staff_member_id, service_id)
);

-- Availability rules table
CREATE TABLE availability_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT,
    staff_member_id INT,
    day_of_week INT NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE CASCADE
);



-- Bookings table
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT NOT NULL,
  service_id INT NOT NULL,
  staff_member_id INT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(255),
  booking_date DATE NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  party_size INT DEFAULT 1,
  special_requests TEXT,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  deposit_paid DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(255),
  confirmation_sent_at DATETIME,
  reminder_sent_at DATETIME,
  cancelled_at DATETIME,
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_member_id) REFERENCES staff_members(id) ON DELETE SET NULL
);

-- TOKEN for Bookings added
-- Step 1: Add the booking_token column
ALTER TABLE bookings
ADD COLUMN booking_token VARCHAR(36) UNIQUE NULL AFTER id;

-- Step 2: Generate tokens for existing bookings (if any)
-- Uses UUID() to create secure random tokens
UPDATE bookings 
SET booking_token = UUID() 
WHERE booking_token IS NULL;

-- Step 3: Make the column NOT NULL after all existing rows have tokens
ALTER TABLE bookings
MODIFY COLUMN booking_token VARCHAR(36) UNIQUE NOT NULL;


-- Admin users table for dashboard authentication
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    venue_id INT,
    role ENUM('owner', 'admin', 'staff') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL
);