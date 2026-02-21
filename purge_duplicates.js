const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images', 'products');

async function scrapeCategory(page, query, countRequired) {
    let allImages = [];
    let pageNum = 1;
    const maxPages = 4;

    while (allImages.length < countRequired && pageNum <= maxPages) {
        const queryEncoded = encodeURIComponent(query);
        const searchUrl = `https://www.flipkart.com/search?q=${queryEncoded}&page=${pageNum}`;
        console.log(`Navigating to ${searchUrl} (Need ~${countRequired} images)`);

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        for (let i = 0; i < 15; i++) {
            await page.evaluate(() => window.scrollBy(0, 500));
            await new Promise(r => setTimeout(r, 500));
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
                    const tEl2 = a.innerText.split('\\n')[0];
                    if (tEl2 && tEl2.length > 5) title = tEl2;
                }

                if (title && img && img.src && !img.src.includes('data:image')) {
                    seen.add(a.href);
                    items.push({ title: title.trim(), imgSrc: img.src });
                }
            });
            return items;
        });

        for (const item of productsOnPage) {
            if (allImages.length >= countRequired) break;
            allImages.push(item);
        }
        pageNum++;
    }

    const finalImagesQueue = [];
    for (let i = 0; i < allImages.length; i++) {
        const item = allImages[i];
        const localFilename = `variety_new_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}.jpeg`;
        const localPath = path.join(imgDir, localFilename);

        try {
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
                finalImagesQueue.push({ path: `/images/products/${localFilename}`, title: item.title });
            }
        } catch (e) { }
    }
    return finalImagesQueue;
}

function generateProducts(imagesQueue, count, highlights) {
    const results = [];
    while (imagesQueue.length >= 4 && results.length < count) {
        const group = [
            imagesQueue.shift(), imagesQueue.shift(), imagesQueue.shift(), imagesQueue.shift()
        ];

        const mainProduct = group[0];
        results.push({
            id: `toy_unique_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            name: mainProduct.title,
            price: 99,
            original_price: 1299,
            rating: parseFloat((4.5 + (Math.random() * 0.4)).toFixed(1)),
            review_count: 1000 + Math.floor(Math.random() * 2000),
            description: `${mainProduct.title} is an attractive, durable product designed for hours of creative play. Features a premium exterior and powerful performance.`,
            highlights: highlights,
            badge: "Assured",
            image_url: group[0].path,
            images: [group[0].path, group[1].path, group[2].path, group[3].path]
        });
    }
    return results;
}

async function main() {
    const productsFile = './src/lib/products.ts';
    const content = fs.readFileSync(productsFile, 'utf8');
    const match = content.match(/export const FALLBACK_PRODUCTS[^\[]*\[([\s\S]*)\];/);

    if (!match) {
        console.log("Could not parse products.ts");
        return;
    }

    let arr = eval('[' + match[1] + ']');
    let uniqueMap = new Map();
    let uniqueArr = [];

    // Purge duplicate titles
    for (const p of arr) {
        if (!uniqueMap.has(p.name)) {
            uniqueMap.set(p.name, true);
            uniqueArr.push(p);
        }
    }

    const missingCount = 50 - uniqueArr.length;
    console.log(`Initial items: ${arr.length}. Unique items: ${uniqueArr.length}. Missing: ${missingCount}`);

    if (missingCount <= 0) {
        console.log("No duplicates to fix!");
        return;
    }

    console.log(`We need ${missingCount} fully distinct replacement products. Launching browser...`);
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    const imagesRequired = missingCount * 4;
    const scrapedImages = await scrapeCategory(page, 'kids educational toys learning games', imagesRequired);

    await browser.close();

    const newItems = generateProducts(scrapedImages, missingCount, {
        "Type": "Educational Kids Toy",
        "Age Group": "3+ Years",
        "Skills": "Cognitive & Motor Skills",
        "Material": "Eco-friendly Materials",
        "Durability": "Highly Durable"
    });

    const finalArr = [...uniqueArr, ...newItems];

    // Secondary uniqueness check to be absolutely sure
    let absoluteSet = new Set();
    let strictlyUniqueArr = [];
    for (const p of finalArr) {
        if (!absoluteSet.has(p.name)) {
            absoluteSet.add(p.name);
            strictlyUniqueArr.push(p);
        }
    }

    const fallbackProductsBase = `import type { Product } from './supabase';\n\nexport const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = [\n`;
    const newContent = fallbackProductsBase + strictlyUniqueArr.map(t => JSON.stringify(t, null, 2)).join(',\\n') + '\\n];\\n';

    fs.writeFileSync(productsFile, newContent);
    console.log(`Saved ${strictlyUniqueArr.length} 100% strictly UNIQUE products back to products.ts!`);

    const { execSync } = require('child_process');
    execSync('node generate_sql.js', { stdio: 'inherit' });
    console.log('SQL generated automatically.');
}

main().catch(console.error);
