-- RS DETAILING - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CUSTOMERS
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(phone)
);

-- =====================================================
-- 2. CARS
-- =====================================================
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

-- =====================================================
-- 3. SERVICES (Your Menu)
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. BOOKINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    car_id UUID REFERENCES cars(id),
    booking_date DATE NOT NULL,
    booking_time TIME,
    services JSONB NOT NULL DEFAULT '[]',
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    status TEXT CHECK (status IN (
        'pending', 'checked_in', 'working', 'completed', 'delivered', 'cancelled'
    )) DEFAULT 'pending',
    assigned_employee_id UUID,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partiel')) DEFAULT 'pending',
    amount_paid DECIMAL(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID
);

-- =====================================================
-- 5. EXPENSES
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN (
        'supplies', 'bills', 'rent', 'salary', 'other'
    )),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_image TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. DAILY CASH REGISTER
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_cash_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_date DATE UNIQUE NOT NULL,
    opening_amount DECIMAL(10,2) DEFAULT 0,
    cash_sales DECIMAL(10,2) DEFAULT 0,
    credit_sales DECIMAL(10,2) DEFAULT 0,
    free_services DECIMAL(10,2) DEFAULT 0,
    expenses_total DECIMAL(10,2) DEFAULT 0,
    expected_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2),
    difference DECIMAL(10,2),
    closed_by UUID,
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DISABLE RLS FOR MVP (Enable later for production)
-- =====================================================
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cash_register DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- =====================================================
-- SAMPLE DATA (Delete these after testing)
-- =====================================================

-- Sample Services (Your Menu)
INSERT INTO services (name_ar, base_price, duration_minutes) VALUES
('غسيل خارجي', 500, 30),
('غسيل داخلي', 800, 45),
('غسيل كامل', 1200, 60),
('تلميع', 2500, 120),
('سيراميك', 15000, 480),
('غسيل المحرك', 1000, 45)
ON CONFLICT DO NOTHING;

-- Sample Customer
INSERT INTO customers (id, phone, full_name) VALUES
('11111111-1111-1111-1111-111111111111', '0555123456', 'محمد أمين')
ON CONFLICT (phone) DO NOTHING;

-- Sample Car
INSERT INTO cars (id, customer_id, plate_number, make, model, color) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '123456-04', 'Toyota', 'Hilux', 'أبيض')
ON CONFLICT DO NOTHING;

-- Sample Booking (Today)
INSERT INTO bookings (id, customer_id, car_id, booking_date, booking_time, services, total_price, status, payment_status, amount_paid) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', CURRENT_DATE, '10:00', '["غسيل كامل", "تلميع"]', 3700, 'completed', 'paid', 3700)
ON CONFLICT DO NOTHING;

-- Sample Expense (Today)
INSERT INTO expenses (category, amount, description, expense_date) VALUES
('supplies', 1500, 'شمبوان + صابون', CURRENT_DATE),
('bills', 2000, 'فاتورة الكهرباء', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Sample Cash Register (Today)
INSERT INTO daily_cash_register (register_date, opening_amount, cash_sales, expenses_total, expected_amount) VALUES
(CURRENT_DATE, 5000, 15000, 3500, 16500)
ON CONFLICT (register_date) DO NOTHING;
