const fs = require('fs');
const content = fs.readFileSync('src/lib/products.ts', 'utf8');
const match = content.match(/export const FALLBACK_PRODUCTS[^\[]*\[([\s\S]*)\];/);

if (match) {
    const arr = eval('[' + match[1] + ']');
    let sql = 'DELETE FROM products;\n\n';

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
