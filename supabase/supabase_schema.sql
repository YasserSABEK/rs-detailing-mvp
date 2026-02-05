-- SR DETAILING - PRODUCTION READY SCHEMA (V2.0)
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. EMPLOYEES TABLE (Shop Workers)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'detailer')) DEFAULT 'detailer',
    pin_code TEXT NOT NULL, -- Will be hashed
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ, -- Soft delete
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(phone)
);

-- 4. CARS TABLE
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    plate_number TEXT,
    make TEXT,
    model TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. SERVICES TABLE (Menu)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BOOKINGS TABLE (Core)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    car_id UUID REFERENCES cars(id),
    
    -- Scheduling
    booking_date DATE NOT NULL CHECK (booking_date >= CURRENT_DATE),
    booking_time TIME,
    
    -- Services (Stored as JSON array of service IDs)
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    
    -- Status Workflow
    status TEXT CHECK (status IN (
        'pending',      -- Booked
        'checked_in',   -- Car arrived
        'working',      -- In progress
        'completed',    -- Done
        'delivered',    -- Customer took car
        'cancelled'     -- Cancelled
    )) DEFAULT 'pending',
    
    -- Assignment
    assigned_employee_id UUID REFERENCES employees(id),
    
    -- Payment
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partiel')) DEFAULT 'pending',
    amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
    
    -- Notes
    internal_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES employees(id)
);

-- 7. BOOKING STATUS HISTORY (Audit)
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES employees(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN (
        'supplies',      -- Sel3a
        'bills',         -- Triciti
        'rent',          -- Location
        'salary',        -- Khdamin
        'other'          -- Kifkif
    )),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_image TEXT,
    created_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DAILY CASH REGISTER (End of Day)
CREATE TABLE IF NOT EXISTS daily_cash_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_date DATE UNIQUE NOT NULL,
    
    -- System Calculations
    opening_amount DECIMAL(10,2) DEFAULT 0,
    cash_sales DECIMAL(10,2) DEFAULT 0,
    credit_sales DECIMAL(10,2) DEFAULT 0,
    free_services DECIMAL(10,2) DEFAULT 0,
    expenses_total DECIMAL(10,2) DEFAULT 0,
    
    -- Reconciliation
    expected_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2), -- Physical count
    difference DECIMAL(10,2),
    
    closed_by UUID REFERENCES employees(id),
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 11. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin sees everything
CREATE POLICY "admin_all_bookings" ON bookings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
    );

CREATE POLICY "admin_all_customers" ON customers FOR ALL USING (true);
CREATE POLICY "admin_all_cars" ON cars FOR ALL USING (true);
CREATE POLICY "admin_all_expenses" ON expenses FOR ALL USING (true);

-- Employees see assigned bookings + necessary data to work
CREATE POLICY "employee_view_bookings" ON bookings
    FOR SELECT USING (
        assigned_employee_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND role = 'admin')
    );
    
-- Default services view
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_view_services" ON services FOR SELECT USING (is_active = true);
