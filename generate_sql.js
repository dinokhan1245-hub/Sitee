const fs = require('fs');
const content = fs.readFileSync('src/lib/products.ts', 'utf8');
const match = content.match(/export const FALLBACK_PRODUCTS[^\[]*\[([\s\S]*)\];/);

if (match) {
    const arr = eval('[' + match[1] + ']');
    let sql = `-- Recreate schema if not exists
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
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  utr TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  payment_expires_at TIMESTAMPTZ
);

DELETE FROM products;

`;

    arr.forEach(p => {
        const imgs = p.images ? p.images.map(i => "'" + i + "'").join(',') : "'" + p.image_url + "'";
        const highlightsStr = p.highlights ? JSON.stringify(p.highlights).replace(/'/g, "''") : '{}';
        const desc = p.description.replace(/'/g, "''");
        const name = p.name.replace(/'/g, "''");

        sql += `INSERT INTO products (id, name, description, price, original_price, rating, review_count, badge, image_url, images, highlights) VALUES ('${p.id}', '${name}', '${desc}', ${p.price}, ${p.original_price || 'NULL'}, ${p.rating || 4.5}, ${p.review_count || 0}, '${p.badge || 'Assured'}', '${p.image_url}', ARRAY[${imgs}], '${highlightsStr}'::jsonb);\n`;
    });

    fs.writeFileSync('seed_50_toys.sql', sql);
    console.log('Successfully generated seed_50_toys.sql for Supabase!');
} else {
    console.log('Could not parse products.ts');
}
