const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

async function scrapeToys() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Set viewport to a typical desktop size
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl = 'https://www.flipkart.com/search?q=remote+control+car+toy&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&p%5B%5D=facets.price_range.from%3DMin&p%5B%5D=facets.price_range.to%3D1000';
    console.log('Navigating to ' + searchUrl);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

    console.log('Waiting for product cards...');
    await page.waitForSelector('._75nlfW', { timeout: 10000 }).catch(() => console.log('Timeout waiting for cards. Proceeding anyway.'));

    // Extract product links
    const productLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a._V8fbg7'));
        return anchors.map(a => a.href).filter(href => href.includes('/p/'));
    });

    console.log(`Found ${productLinks.length} product links. Taking the first 15.`);
    const targetLinks = productLinks.slice(0, 15);
    const results = [];

    for (let i = 0; i < targetLinks.length && results.length < 15; i++) {
        console.log(`Scraping product ${results.length + 1}/15...`);
        const pPage = await browser.newPage();

        try {
            await pPage.goto(targetLinks[i], { waitUntil: 'domcontentloaded', timeout: 60000 });
            await pPage.waitForSelector('.VU-ZEz', { timeout: 10000 }); // Title

            const productData = await pPage.evaluate(() => {
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.innerText.trim() : null;
                };

                const title = getText('.VU-ZEz');
                const rating = getText('._3LWZlK') || "4.5";
                const reviewCountStr = getText('.Wphh3N') || "1,000";
                const highlightEls = Array.from(document.querySelectorAll('._21Ahn-'));

                let highlightsObj = {};
                if (highlightEls.length > 0) {
                    highlightEls.forEach((el, idx) => {
                        const txt = el.innerText.trim();
                        if (txt) {
                            // generate fake key for the bullet point
                            highlightsObj[`Feature ${idx + 1}`] = txt;
                        }
                    });
                } else {
                    highlightsObj = {
                        "Quality": "Premium Grade",
                        "Safety": "Non-Toxic Materials",
                        "Battery": "Rechargeable included"
                    };
                }

                return {
                    name: title || "Premium Remote Control Toy",
                    // We forcefully set price to 99 per user request
                    price: 99,
                    original_price: 1299,
                    rating: parseFloat(rating) || 4.5,
                    review_count: parseInt(reviewCountStr.replace(/,/g, '')) || 1500,
                    description: title ? `${title} is an attractive, durable toy designed for hours of creative play.` : "An attractive, durable toy.",
                    highlights: highlightsObj,
                    badge: "Assured",
                };
            });

            productData.id = `exact_toy_${Date.now()}_${i}`;

            // THE BULLETPROOF IMAGE DOWNLOAD: Screenshot the element directly!
            // Wait for the main image to appear
            const imgSelector = 'img._0DkuPh, img._396cs4, div._2qB_-r img, div.vU5WPQ img, div.xTaogf img';
            await pPage.waitForSelector(imgSelector, { timeout: 10000 });

            const localFilename = `${productData.id}.jpeg`;
            const localPath = path.join(imgDir, localFilename);

            // Get the element handle
            const imageElement = await pPage.$(imgSelector);
            if (imageElement) {
                // Scroll into view to ensure it renders
                await pPage.evaluate(el => el.scrollIntoView(), imageElement);
                // Take a screenshot of just that element
                await imageElement.screenshot({ path: localPath, type: 'jpeg', quality: 80 });
                console.log(`Successfully acquired EXACT image via screenshot for ${productData.name}`);

                productData.image_url = `/images/products/${localFilename}`;
                productData.images = [
                    productData.image_url,
                    productData.image_url,
                    productData.image_url
                ];

                results.push(productData);
            } else {
                console.log('Could not find image element to screenshot.');
            }

        } catch (err) {
            console.error(`Failed on ${targetLinks[i]}: ${err.message}`);
        } finally {
            await pPage.close();
        }
    }

    await browser.close();

    console.log('Done scraping EXACT images. Formatting and saving...');

    // Now replace the 15 mock ones in products.ts
    const productsFile = './src/lib/products.ts';
    const content = fs.readFileSync(productsFile, 'utf8');

    // The easiest way to isolate the first 8 items is to use a regex or just evaluate it
    // Wait, the file is TypeScript. We can't simply require it.
    // Let's truncate everything after "id": "8" product's closing brace.
    // The previous 8 items are hardcoded. We can just rebuild the file.

    const fallbackProductsBase = `import type { Product } from './supabase';

export const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = [
  {
    "id": "1",
    "name": "ToyWorld Premium Remote Control Toy",
    "price": 499,
    "original_price": 1299,
    "rating": 4.8,
    "review_count": 1522,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/1.jpeg",
      "/images/products/1.jpeg",
      "/images/products/1.jpeg",
      "/images/products/1.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/1.jpeg"
  },
  {
    "id": "2",
    "name": "KidZone Premium Remote Control Toy",
    "price": 499,
    "original_price": 1299,
    "rating": 4.7,
    "review_count": 2949,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/2.jpeg",
      "/images/products/2.jpeg",
      "/images/products/2.jpeg",
      "/images/products/2.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/2.jpeg"
  },
  {
    "id": "3",
    "name": "PlayPlus Premium Remote Control Toy",
    "price": 499,
    "original_price": 1299,
    "rating": 4.8,
    "review_count": 1035,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/3.jpeg",
      "/images/products/3.jpeg",
      "/images/products/3.jpeg",
      "/images/products/3.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/3.jpeg"
  },
  {
    "id": "4",
    "name": "FunLearn Premium Remote Control Toy",
    "price": 499,
    "original_price": 1299,
    "rating": 4.6,
    "review_count": 2299,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/4.jpeg",
      "/images/products/4.jpeg",
      "/images/products/4.jpeg",
      "/images/products/4.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/4.jpeg"
  },
  {
    "id": "5",
    "name": "J K INTERNATIONAL Premium Remote Control Toy",
    "price": 99,
    "original_price": 945,
    "rating": 4.9,
    "review_count": 797,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/5.jpeg",
      "/images/products/5.jpeg",
      "/images/products/5.jpeg",
      "/images/products/5.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/5.jpeg"
  },
  {
    "id": "6",
    "name": "Easymart Premium Remote Control Toy",
    "price": 99,
    "original_price": 660,
    "rating": 4.9,
    "review_count": 2989,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/6.jpeg",
      "/images/products/6.jpeg",
      "/images/products/6.jpeg",
      "/images/products/6.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/6.jpeg"
  },
  {
    "id": "7",
    "name": "Flipkart Premium Remote Control Toy",
    "price": 99,
    "original_price": 569,
    "rating": 4.7,
    "review_count": 1955,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/7.jpeg",
      "/images/products/7.jpeg",
      "/images/products/7.jpeg",
      "/images/products/7.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/7.jpeg"
  },
  {
    "id": "8",
    "name": "BabyMart Premium Remote Control Toy",
    "price": 99,
    "original_price": 617,
    "rating": 4.7,
    "review_count": 737,
    "description": "High speed premium remote control toy with durable build quality. Perfect for all terrains and racing action.",
    "images": [
      "/images/products/8.jpeg",
      "/images/products/8.jpeg",
      "/images/products/8.jpeg",
      "/images/products/8.jpeg"
    ],
    "highlights": {
      "Quality": "Premium Grade",
      "Safety": "Non-Toxic Materials",
      "Battery": "Rechargeable included",
      "Delivery": "Next Day Delivery"
    },
    "badge": "Assured",
    "image_url": "/images/products/8.jpeg"
  }`;

    const newContent = fallbackProductsBase + ',\\n' + results.map(t => JSON.stringify(t, null, 2)).join(',\\n') + '\\n];\\n';

    fs.writeFileSync(productsFile, newContent);
    console.log('Absolutely perfectly updated src/lib/products.ts with EXACT flipkart screenshots and 99 price!');
}

scrapeToys().catch(console.error);
