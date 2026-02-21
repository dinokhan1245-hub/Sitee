-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR PRIMARY KEY, 
  value TEXT
);

INSERT INTO settings (id, value) VALUES ('qr_code', 'https://example.com/qr.png') ON CONFLICT DO NOTHING;

-- Products table (New Schema)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 99,
  original_price INTEGER,
  rating DECIMAL(2,1) DEFAULT 4.2,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  images TEXT[] DEFAULT '{}',
  highlights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT -- Keeping for legacy fallback if needed
);

-- Orders table (checkout + payment)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment | paid | cancelled
  utr TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  payment_expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow update settings" ON settings FOR UPDATE USING (true);