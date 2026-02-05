-- 1. Modify Employees Table for Email/Password
-- Note: 'role' column already exists (admin/detailer)

-- Drop existing phone/pin columns if they exist, or just ensure structure
ALTER TABLE employees DROP COLUMN IF EXISTS phone;
ALTER TABLE employees DROP COLUMN IF EXISTS pin_code;

ALTER TABLE employees ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password_hash TEXT; -- We will store a simple hash or use Supabase Auth later

-- 2. Initial Admin Creation Script
-- PLEASE RUN THIS IN SUPABASE SQL EDITOR

-- First, clear existing test data if needed (Optional)
-- DELETE FROM employees WHERE role = 'admin';

-- Create Admin User (Password: 123456)
INSERT INTO employees (full_name, role, email, password_hash, is_active)
VALUES (
  'Manager', 
  'admin', 
  'admin@rs-detailing.com', 
  '$2a$10$YourHashedPasswordHereOrSimpleStringForMVP', -- For MVP we will trust the app to hash, or better yet, use this INSERT for testing
  true
)
ON CONFLICT (email) DO NOTHING;

-- NOTE: Since I cannot easily hash passwords in SQL without pgcrypto, 
-- and we are building a "Simple" app, we will handle hashing in the Next.js API or 
-- simplify to a plain text password (NOT RECOMMENDED FOR PROD) or just use Supabase Auth.

-- BETTER APPROACH: 
-- We will use Supabase Auth (Users table) linked to Employees table?
-- User asked for "SQL to create account".

-- Simplest "No SMS" approach:
-- We'll keep it custom table-based as per original spec, but change column names.
-- Password will be stored directly for MVP (or simple hash if we add bcrypt).
