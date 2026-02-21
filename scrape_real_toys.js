const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeRealToys() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navigating to Flipkart Toy section...');
    await page.goto('https://www.flipkart.com/search?q=remote+control+toys', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Waiting for product cards to load...');
    await page.waitForSelector('div[data-id]', { timeout: 15000 }).catch(() => console.log('Timeout waiting for cards!'));

    // Sleep for 3 seconds to let React client render the cards
    await new Promise(r => setTimeout(r, 3000));

    const productLinks = await page.evaluate(() => {
        const links = [];
        const cards = document.querySelectorAll('div[data-id] a');
        for (let i = 0; i < cards.length; i++) {
            const href = cards[i].href;
            // Don't grab internal nav links, ensure it looks like a product link
            if (href && href.includes('/p/') && !links.includes(href)) {
                links.push(href);
            }
            if (links.length >= 8) break;
        }
        return links;
    });

    if (productLinks.length === 0) {
        console.log('Failed to find product links. The DOM selectors might be outdated.');
        await browser.close();
        return;
    }

    console.log(`Found ${productLinks.length} product links. Scraping details...`);
    const scrapedProducts = [];

    for (let i = 0; i < productLinks.length; i++) {
        console.log(`Scraping product ${i + 1}/${productLinks.length}...`);
        try {
            await page.goto(productLinks[i], { waitUntil: 'domcontentloaded', timeout: 30000 });

            await new Promise(r => setTimeout(r, 2000));

            const productData = await page.evaluate((idIndex) => {
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.innerText.trim() : '';
                };

                const title = getText('span.VU-ZEz, span.B_NuCI, h1') || `Premium Remote Control Toy ${idIndex + 1}`;

                const images = [];

                // Flipkart thumbnail images often have class classes like q6DClP, vXRm-m, etc
                const imgEls = document.querySelectorAll('img.q6DClP, img.vXRm-m, img._396cs4, div._1A_Q_r img, div._3YNWH1 img, div._3kidJX img');

                imgEls.forEach(img => {
                    let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                    if (src && !src.includes('data:image') && !src.includes('placeholder')) {
                        // Try to fetch highest res (832x832 usually)
                        src = src.replace(/\/\d+\/\d+\//, '/832/832/');
                        if (!images.includes(src)) {
                            images.push(src);
                        }
                    }
                });

                const finalImages = images.slice(0, 4);

                return {
                    id: (idIndex + 1).toString(),
                    name: title,
                    price: 99,
                    original_price: Math.floor(Math.random() * (1500 - 400 + 1)) + 400,
                    rating: 4.5 + (Math.random() * 0.4),
                    review_count: Math.floor(Math.random() * 3000) + 100,
                    description: getText('div._1mXcCf, div.X3BRjv') || "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
                    images: finalImages,
                    highlights: {
                        "Quality": "Premium Grade",
                        "Safety": "Non-Toxic Materials",
                        "Battery": "Rechargeable included",
                        "Delivery": "Next Day Delivery"
                    },
                    badge: "Assured",
                    image_url: finalImages.length > 0 ? finalImages[0] : ''
                };
            }, i);

            if (productData.images.length === 0) {
                const fallbackImg = 'https://rukminim2.flixcart.com/image/832/832/xif0q/remote-control-toy/1/8/u/rechargeable-remote-control-rock-crawler-2-4-ghz-4wd-with-original-imahypggy94hh3zx.jpeg';
                productData.images = [fallbackImg, fallbackImg, fallbackImg, fallbackImg];
                productData.image_url = fallbackImg;
            } else while (productData.images.length < 4) {
                productData.images.push(productData.images[0]);
            }

            productData.rating = parseFloat(productData.rating.toFixed(1));
            scrapedProducts.push(productData);

        } catch (err) {
            console.error(`Error scraping link ${i}:`, err.message);
        }
    }

    console.log('Done scraping. Formatting and saving...');

    const outputContent = `import type { Product } from './supabase';\n\nexport const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = ${JSON.stringify(scrapedProducts, null, 2)};\n`;

    fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'products.ts'), outputContent);
    console.log('Successfully updated src/lib/products.ts');

    await browser.close();
}

scrapeRealToys().catch(console.error);
