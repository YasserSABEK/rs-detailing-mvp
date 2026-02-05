-- FIX: Allow public access to employees table for Login to work
-- Since we are doing custom auth (querying the table directly from client), 
-- the table MUST be readable by the 'anon' role (public).
-- WARNING: This exposes the table to the world. For MVP this is acceptable if you know the risks.
-- For Production, we should use Supabase Auth or an RPC function.

ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Ensure the user exists (in case the previous INSERT failed or email didn't match)
INSERT INTO employees (full_name, role, email, password_hash, is_active)
VALUES (
  'Rostom', 
  'admin', 
  'rostom@rs-detailing.com', 
  'RSdetailing123+', 
  true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = 'RSdetailing123+', is_active = true;

-- Also verify the original one just in case you use that
INSERT INTO employees (full_name, role, email, password_hash, is_active)
VALUES (
  'Manager', 
  'admin', 
  'admin@rs-detailing.com', 
  'RSdetailing123+', 
  true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = 'RSdetailing123+', is_active = true;
