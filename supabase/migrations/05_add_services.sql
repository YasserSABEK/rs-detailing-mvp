-- Add default services to the menu
-- Run this in Supabase SQL Editor if you don't have services yet

INSERT INTO services (name_ar, base_price, duration_minutes) VALUES
('غسيل خارجي', 500, 30),
('غسيل داخلي', 800, 45),
('غسيل كامل', 1200, 60),
('غسيل كامل + تلميع', 2000, 90),
('تلميع خارجي', 1500, 60),
('تلميع كامل', 3000, 120),
('سيراميك', 15000, 480),
('غسيل المحرك', 1000, 45),
('تنظيف الفرش', 2500, 120),
('إزالة الروائح', 1000, 30)
ON CONFLICT DO NOTHING;
