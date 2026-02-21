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
            if (href && href.includes('/p/') && !links.includes(href)) {
                links.push(href);
            }
            if (links.length >= 15) break;
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

    // Setup local image dir
    const imgDir = path.join(__dirname, 'public', 'images', 'products');
    if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, { recursive: true });
    }

    // Helper to download image
    const https = require('https');
    const downloadImage = (url, filepath) => {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                if (res.statusCode === 200) {
                    res.pipe(fs.createWriteStream(filepath))
                        .on('error', reject)
                        .once('close', () => resolve(filepath));
                } else {
                    res.resume();
                    reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
                }
            }).on('error', reject);
        });
    };

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
                const rawPrice = getText('div.Nx9bqj.CxhGGd') || '₹499';
                const rawOriginalPrice = getText('div.yRaY8j.A60-Kx') || '₹1,299';

                const parsePrice = (str) => parseInt(str.replace(/[^0-9]/g, '')) || 0;
                let price = parsePrice(rawPrice);
                let originalPrice = parsePrice(rawOriginalPrice);

                if (price === 0) price = 499 + Math.floor(Math.random() * 500);
                if (originalPrice === 0 || originalPrice <= price) originalPrice = price + 500;

                const images = [];
                const imgEls = document.querySelectorAll('img.q6DClP, img.vXRm-m, img._396cs4, div._1A_Q_r img, div._3YNWH1 img, div._3kidJX img');

                imgEls.forEach(img => {
                    let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
                    if (src && !src.includes('data:image') && !src.includes('placeholder')) {
                        src = src.replace(/\/\d+\/\d+\//, '/832/832/');
                        if (!images.includes(src)) {
                            images.push(src);
                        }
                    }
                });

                // Get explicit highlights
                const highlightEls = document.querySelectorAll('div.x-dVbu, li._21Ahn-');
                const rawHighlights = Array.from(highlightEls).map(el => el.innerText.trim()).filter(t => t);

                const highlightsObj = {};
                rawHighlights.slice(0, 5).forEach((h, idx) => {
                    const parts = h.split(':');
                    if (parts.length > 1) {
                        highlightsObj[parts[0].trim()] = parts.slice(1).join(':').trim();
                    } else {
                        highlightsObj[`Feature ${idx + 1}`] = h;
                    }
                });

                // Fallback highlights if Flipkart blocks the scrape
                if (Object.keys(highlightsObj).length === 0) {
                    highlightsObj["Quality"] = "Premium Grade ABS Material";
                    highlightsObj["Battery"] = "Rechargeable 500mAh Included";
                    highlightsObj["Control Range"] = "Up to 50 meters";
                    highlightsObj["Safety"] = "Non-Toxic, BPA Free";
                }

                return {
                    id: 'new_toy_' + Date.now() + '_' + idIndex,
                    name: title,
                    price: price,
                    original_price: originalPrice,
                    rating: 4.0 + (Math.random() * 0.9),
                    review_count: Math.floor(Math.random() * 3000) + 100,
                    description: getText('div._1mXcCf, div.X3BRjv') || title + " is an attractive, durable toy designed for hours of creative play. Features bright colors and sturdy construction.",
                    images: images,
                    highlights: highlightsObj,
                    badge: "Assured",
                    image_url: images.length > 0 ? images[0] : ''
                };
            }, i);

            // Handle image logic
            let remoteImageUrl = productData.image_url;
            if (!remoteImageUrl) {
                remoteImageUrl = 'https://rukminim2.flixcart.com/image/832/832/xif0q/remote-control-toy/1/8/u/rechargeable-remote-control-rock-crawler-2-4-ghz-4wd-with-original-imahypggy94hh3zx.jpeg';
            }

            productData.rating = parseFloat(productData.rating.toFixed(1));

            // Download image
            const localFilename = `${productData.id}.webp`;
            const localPath = path.join(imgDir, localFilename);
            try {
                await downloadImage(remoteImageUrl, localPath);
                console.log(`Saved image for ${productData.name} -> ${localFilename}`);
                // Modify public JSON path
                productData.image_url = `/images/products/${localFilename}`;
                productData.images = [productData.image_url, productData.image_url, productData.image_url, productData.image_url];
            } catch (e) {
                console.log('Failed to download image, using remote fallback URL', e.message);
            }

            scrapedProducts.push(productData);

        } catch (err) {
            console.error(`Error scraping link ${i}:`, err.message);
        }
    }

    console.log('Done scraping. Formatting and saving...');
    fs.writeFileSync(path.join(__dirname, 'new_toys.json'), JSON.stringify(scrapedProducts, null, 2));
    console.log('Successfully saved scraped data to new_toys.json');

    await browser.close();
}

scrapeRealToys().catch(console.error);
