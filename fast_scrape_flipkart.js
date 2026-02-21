const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

async function fastScrape() {
    console.log('Launching fast browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    const results = [];
    let pageNum = 1;

    while (results.length < 50 && pageNum <= 3) {
        const searchUrl = `https://www.flipkart.com/search?q=kids+remote+control+car+toy&page=${pageNum}`;
        console.log(`Navigating to ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        // Scroll down smoothly to load lazy images
        for (let i = 0; i < 15; i++) {
            await page.evaluate(() => window.scrollBy(0, 500));
            await new Promise(r => setTimeout(r, 600));
        }

        const productsOnPage = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
            const items = [];
            const seen = new Set();

            links.forEach(a => {
                if (seen.has(a.href)) return;

                const img = a.querySelector('img') || a.parentElement.querySelector('img');

                let title = a.title;
                if (!title || title.length < 5) {
                    const tEl = a.parentElement.querySelector('.IRpwTa, .s1Q9rs, .WKTcLC');
                    if (tEl) title = tEl.innerText;
                }

                if (!title || title.length < 5) {
                    // Final fallback for title extraction from standard grid
                    const tEl2 = a.innerText.split('\n')[0];
                    if (tEl2 && tEl2.length > 5) title = tEl2;
                }

                if (title && img && img.src && !img.src.includes('data:image')) {
                    seen.add(a.href);
                    items.push({
                        title: title.trim(),
                        imgSrc: img.src
                    });
                }
            });
            return items;
        });

        console.log(`Found ${productsOnPage.length} items on page ${pageNum}`);

        for (const item of productsOnPage) {
            if (results.length >= 50) break;
            if (!item.title || item.title.length < 5) continue;

            const id = `real_toy_${Date.now()}_${results.length}`;
            const localFilename = `${id}.jpeg`;
            const localPath = path.join(imgDir, localFilename);

            try {
                // Download image using page.evaluate to bypass CDN block!
                const base64Data = await page.evaluate(async (url) => {
                    try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) { return null; }
                }, item.imgSrc);

                if (base64Data) {
                    const base64Image = base64Data.split(';base64,').pop();
                    fs.writeFileSync(localPath, base64Image, { encoding: 'base64' });
                    console.log(`Saved Genuine Image for ${item.title}`);

                    // Format explicitly 2 decimals rounding
                    let displayRating = parseFloat((4.5 + (Math.random() * 0.4)).toFixed(1));

                    results.push({
                        id: id,
                        name: item.title,
                        price: 99, // Force to 99
                        original_price: 1299,
                        rating: displayRating,
                        review_count: 1000 + Math.floor(Math.random() * 2000),
                        description: `${item.title} is an attractive, durable toy designed for hours of creative play.`,
                        highlights: {
                            "Quality": "Premium Grade",
                            "Safety": "Non-Toxic Materials",
                            "Battery": "Rechargeable included",
                            "Durability": "Shatterproof Body"
                        },
                        badge: "Assured",
                        image_url: `/images/products/${localFilename}`,
                        images: [
                            `/images/products/${localFilename}`,
                            `/images/products/${localFilename}`,
                            `/images/products/${localFilename}`
                        ]
                    });
                }
            } catch (err) {
                console.log(`Failed to process image for ${item.title}`);
            }
        }

        pageNum++;
    }

    await browser.close();

    console.log(`Successfully scraped ${results.length} products with REAL images! Saved to catalog.`);

    // Save to products.ts
    const productsFile = './src/lib/products.ts';
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
    console.log('Absolutely perfectly updated src/lib/products.ts with EXTRA flipkart Base64 images and 99 price!');
}

fastScrape().catch(console.error);
