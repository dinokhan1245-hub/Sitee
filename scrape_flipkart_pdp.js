const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

async function deepScrape() {
    console.log('Launching stealth browser...');
    const browser = await puppeteer.launch({ headless: 'new' });

    // Pass 1: Collect Links
    let productLinks = [];
    const searchPage = await browser.newPage();
    await searchPage.setViewport({ width: 1280, height: 1000 });

    for (let p = 1; p <= 3; p++) {
        const url = `https://www.flipkart.com/search?q=kids+remote+control+car+toy&page=${p}`;
        console.log(`Fetching links from ${url}`);
        await searchPage.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
        const links = await searchPage.evaluate(() => {
            const anchors = document.querySelectorAll('a[href*="/p/"]');
            return Array.from(anchors).map(a => a.href).filter(href => !href.includes('product-reviews'));
        });
        productLinks.push(...links);
        if (productLinks.length >= 50) break;
    }
    await searchPage.close();

    // Deduplicate
    productLinks = [...new Set(productLinks)].slice(0, 45);
    console.log(`Harvested ${productLinks.length} unique PDP links. Navigating deep...`);

    const results = [];

    for (let i = 0; i < productLinks.length; i++) {
        const link = productLinks[i];
        console.log(`[${i + 1}/${productLinks.length}] Scraping thoroughly: ${link.split('?')[0]}`);

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1000 });

        try {
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 50000 });
            await new Promise(r => setTimeout(r, 2000));

            const productData = await page.evaluate(async () => {
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.innerText.trim() : null;
                };

                const title = getText('.VU-ZEz') || getText('.B_NuCI') || getText('h1');
                if (!title) return null;

                const rating = getText('._3LWZlK') || "4.6";
                const reviewCountStr = getText('.Wphh3N') || "1,000";

                // Extract unique gallery images (usually in a list <ul> or <div> on the left)
                // We'll scrape all high res image URLs we can find in the DOM that look like product images
                const imgs = Array.from(document.querySelectorAll('img')).map(img => img.src);

                // Filter to rukminim URLs that aren't logos
                let validImageUrls = imgs.filter(src => src.includes('rukminim') && !src.includes('logo') && !src.includes('data:image'));

                // Flipkart often loads low-res thumbs. We can string-replace to get 832x832 if they follow standard pattern
                // Example: https://rukminim2.flixcart.com/image/128/128/xif0q/... -> /image/832/832/
                validImageUrls = validImageUrls.map(src => src.replace(/\/\d+\/\d+\//, '/832/832/'));

                // Deduplicate explicitly
                validImageUrls = [...new Set(validImageUrls)];

                // Only take first 4 distinct images that actually exist
                const finalImages = [];
                for (let imgUrl of validImageUrls) {
                    if (finalImages.length >= 4) break;
                    try {
                        const res = await fetch(imgUrl);
                        if (res.ok) {
                            const blob = await res.blob();
                            const b64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            finalImages.push(b64);
                        }
                    } catch (e) { }
                }

                return {
                    title: title,
                    rating: parseFloat(rating) || 4.6,
                    reviewCountStr: reviewCountStr,
                    base64Images: finalImages
                };
            });

            if (productData && productData.base64Images && productData.base64Images.length >= 1) {
                const id = `toy_${Date.now()}_${i}`;
                const localImagePaths = [];

                // Save up to 4 images
                for (let j = 0; j < productData.base64Images.length; j++) {
                    const b64Str = productData.base64Images[j].split(';base64,').pop();
                    const filename = `${id}_img${j + 1}.jpeg`;
                    const filepath = path.join(imgDir, filename);
                    fs.writeFileSync(filepath, b64Str, { encoding: 'base64' });
                    localImagePaths.push(`/images/products/${filename}`);
                }

                // If Flipkart only had 1-3 distinct images, duplicate the last one to fill array to 4
                while (localImagePaths.length < 4) {
                    localImagePaths.push(localImagePaths[localImagePaths.length - 1]);
                }

                let displayRating = parseFloat((4.5 + (Math.random() * 0.4)).toFixed(1));
                let reviews = parseInt(productData.reviewCountStr.replace(/,/g, '')) || 1200;

                // We force price to 99
                results.push({
                    "id": id,
                    "name": productData.title,
                    "price": 99,
                    "original_price": 1299,
                    "rating": displayRating,
                    "review_count": reviews,
                    "description": `${productData.title} is an attractive, durable toy designed for hours of creative play.`,
                    "images": localImagePaths,
                    "highlights": {
                        "Quality": "Premium Grade",
                        "Safety": "Non-Toxic Materials",
                        "Battery": "Rechargeable included",
                        "Delivery": "Next Day Delivery"
                    },
                    "badge": "Assured",
                    "image_url": localImagePaths[0]
                });
                console.log(`Success -> ${productData.title} (Got ${productData.base64Images.length} real distinct images)`);
            } else {
                console.log('Skipped - no valid images found via JS fetch.');
            }
        } catch (e) {
            console.log(`Error navigating to PDP: ${e.message}`);
        } finally {
            await page.close();
        }
    }

    await browser.close();

    console.log(`Deep successfully scraped ${results.length} products with DISTINCT images. Saving...`);

    // Merge into catalog
    const productsFile = './src/lib/products.ts';
    const fallbackProductsBase = `import type { Product } from './supabase';\n\nexport const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = `;
    const newContent = fallbackProductsBase + JSON.stringify(results, null, 2) + ';\n';
    fs.writeFileSync(productsFile, newContent);
    console.log('Saved distinctly to src/lib/products.ts');

}

deepScrape().catch(console.error);
