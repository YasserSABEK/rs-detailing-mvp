-- Fix: Disable RLS on services table to allow inserts
-- Run this in Supabase SQL Editor

ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Also ensure all other tables have RLS disabled for MVP
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cash_register DISABLE ROW LEVEL SECURITY;
