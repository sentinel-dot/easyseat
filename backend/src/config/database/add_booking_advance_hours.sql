-- Migration: Add booking_advance_hours to venues table
-- This defines the minimum advance booking time required for customers
-- (e.g., 48 hours = customers can only book appointments at least 48 hours in advance)
-- 
-- Admin users can bypass this restriction when creating manual bookings

USE easyseatdb;

-- Add booking_advance_hours column (default: 48 hours)
ALTER TABLE venues 
ADD COLUMN booking_advance_hours INT DEFAULT 48 
COMMENT 'Minimum hours in advance customers must book (admins can bypass)';

-- Update description for clarity
ALTER TABLE venues 
MODIFY COLUMN cancellation_hours INT DEFAULT 24 
COMMENT 'Minimum hours in advance for cancellations';
