const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeToys() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const searchQuery = 'kids toys';
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&sort=popularity`;

    console.log(`Navigating to ${searchUrl}...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Evaluating product list...');

    // Wait for product links, these classes change often but 'a[target="_blank"]' within main grid is common
    await page.waitForSelector('a[target="_blank"]', { timeout: 10000 }).catch(() => console.log('Timeout waiting for links'));

    const productUrls = await page.evaluate(() => {
        // Attempt to grab standard grid item links
        const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
        return links.map(a => a.href).filter(href => href.includes('/p/'));
    });

    // Unique URLs for safety
    const uniqueUrls = [...new Set(productUrls)].slice(0, 8);
    console.log(`Found ${uniqueUrls.length} unique products to scrape.`);

    const scrapedProducts = [];

    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        console.log(`\n[${i + 1}/${uniqueUrls.length}] Scraping: ${url}`);

        try {
            const productPage = await browser.newPage();
            await productPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await productPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            const data = await productPage.evaluate(() => {
                // Name from Title tag
                let name = document.title.split('- Buy')[0].trim();
                if (!name || name.length < 5) name = "Amazing Kids Toy";

                // Price from meta tags (Flipkart often puts mrp/price in meta)
                let priceStr = '';
                const priceMeta = document.querySelector('meta[name="twitter:data1"], meta[property="product:price:amount"]');
                if (priceMeta) priceStr = priceMeta.content;
                else {
                    const el = document.querySelector('div.Nx9bqj, div._30jeq3');
                    priceStr = el ? el.innerText : '99';
                }
                let price = priceStr ? parseInt(priceStr.replace(/[^0-9]/g, '')) : 99;

                // Original Price
                let origPriceStr = '';
                const elOrig = document.querySelector('div.yRaY8j, div._3I9_wc');
                if (elOrig) origPriceStr = elOrig.innerText;
                let original_price = origPriceStr ? parseInt(origPriceStr.replace(/[^0-9]/g, '')) : price + Math.floor(price * 0.4);

                // Rating
                let ratingStr = '4.5';
                const ratingEl = document.querySelector('div.XQDdHH, div._3LWZlK');
                if (ratingEl) ratingStr = ratingEl.innerText;
                let rating = parseFloat(ratingStr) || 4.5;

                // Description
                let description = '';
                const descMeta = document.querySelector('meta[name="Description"]');
                if (descMeta) description = descMeta.content;
                else description = 'A fantastic highly-rated toy for kids.';
                if (description.length > 500) description = description.substring(0, 500) + '...';

                // Extract multiple images from the left carousel thumb stack
                const imgNodes = document.querySelectorAll('div.vU5WPQ[style*="background-image"], div.q6DClP[style*="background-image"]');
                let images = [];
                imgNodes.forEach(node => {
                    const style = node.getAttribute('style');
                    const match = style.match(/url\((['"]?)(.*?)\1\)/);
                    if (match && match[2]) {
                        // Convert tiny thumb URL to slightly larger res URL
                        const bigUrl = match[2].replace(/\/\d+\/\d+\//, '/832/832/').replace(/\?q=\d+/, '?q=70');
                        images.push(bigUrl);
                    }
                });

                // Fallback main image if thumbnails fail
                if (images.length === 0) {
                    // Sometimes it's right in a meta tag!
                    const imgMeta = document.querySelector('meta[property="og:image"]');
                    if (imgMeta) {
                        images.push(imgMeta.content.replace(/\/\d+\/\d+\//, '/832/832/'));
                    } else {
                        images.push('https://via.placeholder.com/400x400.png?text=Toy+Image');
                    }
                }

                while (images.length < 4 && images.length > 0) {
                    images.push(images[images.length - 1]);
                }
                images = images.slice(0, 4);

                // Extract Highlights
                const highlightList = document.querySelectorAll('div.xFVion ul li, div._2418kt ul li');
                let highlights = {};
                highlightList.forEach((li, idx) => {
                    if (idx < 5) {
                        let text = li.innerText.trim();
                        if (text.includes(':')) {
                            const parts = text.split(':');
                            highlights[parts[0].trim()] = parts.slice(1).join(':').trim();
                        } else if (text.includes('Color:')) {
                            highlights["Color"] = text.replace('Color:', '').trim();
                        } else if (text.includes('Age:')) {
                            highlights["Age"] = text.replace('Age:', '').trim();
                        } else if (idx === 0) {
                            highlights["Material"] = text;
                        } else if (idx === 1) {
                            highlights["Age"] = text;
                        } else {
                            highlights[`Feature ${idx + 1}`] = text;
                        }
                    }
                });

                if (Object.keys(highlights).length === 0) {
                    highlights = {
                        "Material": "Non-toxic Plastic",
                        "Minimum Age": "3+ years",
                        "Skillset": "Creativity & Imagination",
                        "Type": "Educational Toy"
                    };
                }

                return {
                    name, price, original_price, rating, description, images, highlights, badge: 'Assured'
                };
            });

            console.log(`Success: ${data.name.substring(0, 30)}... | ₹${data.price} | ${data.images.length} imgs | ${Object.keys(data.highlights).length} highlights`);
            scrapedProducts.push(data);
            await productPage.close();

            // Delay to avoid blocks
            await new Promise(r => setTimeout(r, 2000));

        } catch (err) {
            console.error(`Failed to scrape ${url}:`, err.message);
        }
    }

    await browser.close();

    // Validate we got 8 diverse products, else fallback to dummy generation
    let finalProducts = scrapedProducts;
    if (finalProducts.length < 8) {
        console.log('Did not get 8 products, generating placeholders...');
        const diff = 8 - finalProducts.length;
        for (let i = 0; i < diff; i++) {
            finalProducts.push({
                name: `Exciting Kid's Activity Toy ${i + 1}`,
                price: 99,
                original_price: 999,
                rating: 4.5,
                description: 'An amazing toy designed to keep children engaged for hours while developing cognitive skills.',
                images: ['https://rukminim2.flixcart.com/image/832/832/xif0q/puzzle/t/c/e/multicolor-educational-toys-shape-sorter-for-kids-toddlers-shape-original-imah3zq2f93xzng7.jpeg?q=70', 'https://via.placeholder.com/832x832', 'https://via.placeholder.com/832x832', 'https://via.placeholder.com/832x832'],
                highlights: { "Material": "Wood", "Skillset": "Motor Skills", "Age": "2-5 Years" },
                badge: 'Hot Deal'
            });
        }
    }


    // Output to a structured JSON file and generate SQL
    fs.writeFileSync('scripts/scraped_toys.json', JSON.stringify(finalProducts, null, 2));
    console.log('Saved to scripts/scraped_toys.json');

    generateSql(finalProducts);
}

function generateSql(products) {
    let sql = `-- Repopulating with detailed scraped toys
TRUNCATE TABLE products CASCADE;

INSERT INTO products (name, description, price, original_price, rating, badge, images, highlights) VALUES\n`;

    const values = products.map(p => {
        const name = p.name.replace(/'/g, "''");
        const desc = p.description ? p.description.replace(/'/g, "''") : '';
        // Arrays and JSON need to be properly formatted for Postgres
        const imagesStr = `ARRAY[${p.images.map(img => `'${img}'`).join(', ')}]`;
        const highlightsJson = `'${JSON.stringify(p.highlights).replace(/'/g, "''")}'::jsonb`;

        return `  ('${name}', '${desc}', ${p.price}, ${p.original_price}, ${p.rating}, '${p.badge}', ${imagesStr}, ${highlightsJson})`;
    });

    sql += values.join(',\n') + ';\n';

    fs.writeFileSync('scripts/seed_toys.sql', sql);
    console.log('Generated SQL to scripts/seed_toys.sql');
}

scrapeToys().catch(console.error);
