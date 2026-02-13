-- Supabase Schema for Mink'd by Mya
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Service Categories Table
CREATE TABLE service_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  category_id TEXT NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  paystack_link TEXT NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT,
  paystack_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table (for Paystack webhook data)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GHS',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  customer_email TEXT NOT NULL,
  service_name TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability Table (for setting available time slots)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, start_time)
);

-- Blocked Dates Table (for holidays, days off)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table (key-value store for app configuration)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default: Sunday (0) is blocked
INSERT INTO settings (key, value) VALUES
  ('blocked_weekdays', '[0]');

-- Create indexes for better query performance
CREATE INDEX idx_bookings_date ON bookings(appointment_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_transactions_reference ON transactions(paystack_reference);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_availability_date ON availability(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default service categories
INSERT INTO service_categories (id, title, sort_order) VALUES
  ('lashes', 'Lash Extensions', 1),
  ('lashRefills', 'Lash Refills', 2),
  ('brows', 'Brows', 3),
  ('lips', 'Lips', 4),
  ('touchUps', 'Touch-Ups', 5),
  ('extras', 'Additional Services', 6);

-- Insert services from fixtures (you can update prices and duration as needed)
INSERT INTO services (id, name, description, features, price, duration_minutes, category_id, paystack_link, popular) VALUES
  -- Lash Extensions
  ('classic-full-set', 'Classic Full Set', 'One extension per natural lash for a natural, elegant look.', ARRAY['Perfect for everyday wear', 'Natural enhancement', 'Customized curl and length', 'Long-lasting results'], 350, 120, 'lashes', 'https://paystack.shop/pay/fbomou2wcd', false),
  ('hybrid-full-set', 'Hybrid Full Set', 'A beautiful blend of classic and volume techniques for added dimension.', ARRAY['Natural with added volume', 'Textured, wispy appearance', 'Best of both worlds', 'Versatile styling'], 450, 150, 'lashes', 'https://paystack.shop/pay/fvanue9sgi', true),
  ('volume-full-set', 'Volume Full Set', 'Multiple lightweight extensions per lash for dramatic, fluffy volume.', ARRAY['Fuller, dramatic look', 'Lightweight & comfortable', 'Perfect for special occasions', 'Maximum impact'], 550, 180, 'lashes', 'https://paystack.shop/pay/k6sx7yh3hk', false),
  ('wet-set', 'Wet Set', 'Wet-look lashes for a bold, statement appearance.', ARRAY['Bold, wet look effect', 'Extra glossy finish', 'Perfect for events', 'Dramatic impact'], 500, 150, 'lashes', 'https://paystack.shop/pay/vyo-230nbe', false),
  ('wispy', 'Wispy', 'Delicate wispy lashes for a soft, feathered appearance.', ARRAY['Soft feathered look', 'Lightweight application', 'Everyday versatile', 'Natural depth'], 450, 150, 'lashes', 'https://paystack.shop/pay/r87hno4hwl', false),
  ('bottom-lashes', 'Bottom Lashes', 'Enhance your lower lash line for a complete eye transformation.', ARRAY['Lower lash enhancement', 'Completes the look', 'Subtle elegance', 'Added definition'], 100, 30, 'lashes', 'https://paystack.shop/pay/dm1zidm01j', false),

  -- Lash Refills
  ('classic-refill', 'Classic Refill', 'Maintain your classic lash set with a refreshing infill.', ARRAY['Replaces shed lashes', 'Maintains fullness', 'Quick appointment', 'Cost-effective'], 200, 60, 'lashRefills', 'https://paystack.shop/pay/e4qlzmjfag', false),
  ('hybrid-refill', 'Hybrid Refill', 'Keep your hybrid lashes looking fresh and full.', ARRAY['Restores volume mix', 'Maintains blend', 'Professional touch-up', 'Ongoing maintenance'], 250, 75, 'lashRefills', 'https://paystack.shop/pay/hvy4liku30', false),
  ('volume-refill', 'Volume Refill', 'Refresh your volume lashes to maintain dramatic fullness.', ARRAY['Restores fullness', 'Maintains drama', 'Quick refresh', 'Like-new appearance'], 300, 90, 'lashRefills', 'https://paystack.shop/pay/ih2qm1msxg', false),
  ('wet-set-refill', 'Wet Set Refill', 'Keep your wet-look lashes glossy and bold.', ARRAY['Maintains wet look', 'Restores shine', 'Bold refresh', 'Statement maintained'], 280, 75, 'lashRefills', 'https://paystack.shop/pay/9k-ib98z5t', false),

  -- Brows
  ('microblading', 'Microblading', 'Semi-permanent eyebrows with precise hair-like strokes.', ARRAY['Hair-like precision', 'Natural appearance', 'Long-lasting (18-24 months)', 'No daily makeup needed'], 800, 180, 'brows', 'https://paystack.shop/pay/ss91h3lywl', true),
  ('ombre-brows', 'Ombré Brows', 'Shaded brows for a fuller, more defined look.', ARRAY['Gradient shading effect', 'Fuller appearance', 'Highly pigmented', 'Bold definition'], 850, 180, 'brows', 'https://paystack.shop/pay/ikvt-3q2t3', false),
  ('combination-brows', 'Combination Brows', 'Microblading strokes with ombré shading for ultimate brows.', ARRAY['Hybrid technique', 'Best of both styles', 'Ultra-realistic', 'Maximum definition'], 900, 210, 'brows', 'https://paystack.shop/pay/00fgen601n', false),

  -- Lips
  ('lip-blush-bottom', 'Lip Blush (Bottom)', 'Semi-permanent color for the lower lip only.', ARRAY['Soft color deposit', 'Natural flush effect', 'Long-lasting', 'Lower lip only'], 400, 90, 'lips', 'https://paystack.shop/pay/iths3g7eaq', false),
  ('lip-blush-both', 'Lip Blush (Both)', 'Semi-permanent color for both upper and lower lips.', ARRAY['Full lip coverage', 'Natural flushed look', 'Long-lasting color', 'Complete enhancement'], 600, 120, 'lips', 'https://paystack.shop/pay/p8qjh91br2', false),
  ('lip-blush-ombre', 'Lip Blush (Ombré Lips)', 'Gradient lip color for a modern, trendy look.', ARRAY['Ombré gradient effect', 'Trendy appearance', 'Dimensional color', 'Premium technique'], 700, 150, 'lips', 'https://paystack.shop/pay/p8qjh91br2', false),

  -- Touch-Ups
  ('microblading-touchup', 'Microblading Touch Up', 'Refresh your microblading for continued perfection.', ARRAY['Restores definition', 'Refreshes color', 'Maintains shape', 'Extended longevity'], 400, 90, 'touchUps', 'https://paystack.shop/pay/wf01s6yd29', false),
  ('ombre-brows-touchup', 'Ombré Brows Touch Up', 'Revitalize your ombré brows with a professional touch-up.', ARRAY['Restores pigment', 'Refreshes shading', 'Maintains boldness', 'Perfect definition'], 450, 90, 'touchUps', 'https://paystack.shop/pay/687oend31d', false),
  ('combination-brows-touchup', 'Combination Brows Touch Up', 'Refresh both microblading and shading for ultimate brows.', ARRAY['Full brow refresh', 'Restores all elements', 'Maintains perfection', 'Complete renewal'], 500, 120, 'touchUps', 'https://paystack.shop/pay/j76wdfs3wt', false),
  ('lip-blush-touchup-bottom', 'Lip Blush Touch Up (Bottom)', 'Refresh color for the lower lip.', ARRAY['Restores color', 'Maintains effect', 'Quick appointment', 'Like-new appearance'], 200, 60, 'touchUps', 'https://paystack.shop/pay/3jbvv-o-xq', false),
  ('lip-blush-touchup-both', 'Lip Blush Touch Up (Both)', 'Refresh color for both upper and lower lips.', ARRAY['Full lip refresh', 'Restores vibrancy', 'Complete color restoration', 'Perfect finish'], 300, 90, 'touchUps', 'https://paystack.shop/pay/h5lowcyagy', false),
  ('lip-blush-touchup-ombre', 'Lip Blush Touch Up (Ombré)', 'Refresh the ombré gradient effect on lips.', ARRAY['Restores gradient', 'Refreshes dimension', 'Maintains trend', 'Perfect ombré effect'], 350, 90, 'touchUps', 'https://paystack.shop/pay/ip08oz59q9', false),

  -- Extras
  ('brow-lamination', 'Brow Lamination', 'Set and shape your natural brows with semi-permanent lamination.', ARRAY['Shapes natural brows', 'Long-lasting hold', 'Fuller appearance', 'Low maintenance'], 150, 45, 'extras', 'https://paystack.shop/pay/n09kvq8l17', false),
  ('brow-tint', 'Brow Tint', 'Add color to your natural eyebrows.', ARRAY['Darkens brows', 'Long-lasting color', 'Natural enhancement', 'Quick application'], 80, 20, 'extras', 'https://paystack.shop/pay/566yqgsrbb', false),
  ('brow-lamination-tint', 'Brow Lamination & Tint', 'Combine lamination and tinting for ultimate brow perfection.', ARRAY['Shape and color', 'Combined benefits', 'Professional results', 'Complete brow transformation'], 200, 60, 'extras', 'https://paystack.shop/pay/zw03vius71', false),
  ('lash-removal', 'Lash Removal', 'Professional removal of your lash extensions.', ARRAY['Gentle removal', 'Protects natural lashes', 'Quick process', 'Safe extraction'], 50, 30, 'extras', 'https://paystack.shop/pay/w6ik5e3rje', false);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for services and categories
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Availability is viewable by everyone" ON availability FOR SELECT USING (true);
CREATE POLICY "Blocked dates are viewable by everyone" ON blocked_dates FOR SELECT USING (true);

-- Bookings: anyone can insert (for customers), but only service role can read/update
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Bookings viewable by service role" ON bookings FOR SELECT USING (true);
CREATE POLICY "Bookings updatable by service role" ON bookings FOR UPDATE USING (true);

-- Transactions: only service role should insert (from webhook)
CREATE POLICY "Transactions viewable by service role" ON transactions FOR SELECT USING (true);
CREATE POLICY "Transactions insertable by service role" ON transactions FOR INSERT WITH CHECK (true);

-- Admin-only write access (managed via service role key in API)
CREATE POLICY "Services manageable by service role" ON services FOR ALL USING (true);
CREATE POLICY "Categories manageable by service role" ON service_categories FOR ALL USING (true);
CREATE POLICY "Availability manageable by service role" ON availability FOR ALL USING (true);
CREATE POLICY "Blocked dates manageable by service role" ON blocked_dates FOR ALL USING (true);
CREATE POLICY "Settings viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings manageable by service role" ON settings FOR ALL USING (true);