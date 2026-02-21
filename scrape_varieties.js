const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

async function scrapeCategory(page, query, countRequired) {
    let allImages = [];
    let pageNum = 1;
    const maxPages = 5;

    while (allImages.length < countRequired && pageNum <= maxPages) {
        const queryEncoded = encodeURIComponent(query);
        const searchUrl = `https://www.flipkart.com/search?q=${queryEncoded}&page=${pageNum}`;
        console.log(`Navigating to ${searchUrl} (Need ~${countRequired} images)`);

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

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
                    const tEl2 = a.innerText.split('\\n')[0];
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

        console.log(`Found ${productsOnPage.length} items on page ${pageNum} for ${query}`);
        for (const item of productsOnPage) {
            if (allImages.length >= countRequired) break;
            allImages.push(item);
        }
        pageNum++;
    }

    const finalImagesQueue = [];
    for (let i = 0; i < allImages.length; i++) {
        const item = allImages[i];
        const localFilename = `variety_img_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}.jpeg`;
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
                finalImagesQueue.push({
                    path: `/images/products/${localFilename}`,
                    title: item.title
                });
            }
        } catch (e) { }
    }
    return finalImagesQueue;
}

function generateProducts(imagesQueue, count, categoryStr) {
    const results = [];
    while (imagesQueue.length >= 4 && results.length < count) {
        const group = [
            imagesQueue.shift(), imagesQueue.shift(), imagesQueue.shift(), imagesQueue.shift()
        ];

        const mainProduct = group[0];
        const id = `toy_variety_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        let displayRating = parseFloat((4.5 + (Math.random() * 0.4)).toFixed(1));

        let highlights = {};
        if (categoryStr === 'lego') {
            highlights = {
                "Type": "Building Blocks",
                "Age Group": "5+ Years",
                "Skills": "Creativity & Hand-Eye Coordination",
                "Material": "Premium Non-Toxic Plastic",
                "Pieces": "Multiple Interlocking Blocks"
            };
        } else {
            highlights = {
                "Type": "Kids Smartwatch",
                "Display": "Digital Touch Screen",
                "Features": "Games, Camera, Alarm",
                "Strap Material": "Soft Silicone",
                "Battery": "Rechargeable included"
            };
        }

        results.push({
            id: id,
            name: mainProduct.title,
            price: 99,
            original_price: 1299,
            rating: displayRating,
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
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    console.log('Scraping 16 distinct RC Trucks...');
    const truckImages = await scrapeCategory(page, 'rc construction toy truck excavator', 16);
    console.log(`Grabbed ${truckImages.length} Truck images.`);

    console.log('Scraping 16 distinct RC Robots...');
    const robotImages = await scrapeCategory(page, 'remote control kids robot toy', 16);
    console.log(`Grabbed ${robotImages.length} Robot images.`);

    console.log('Scraping 16 distinct RC Drones...');
    const droneImages = await scrapeCategory(page, 'kids flying rc drone toy camera', 16);
    console.log(`Grabbed ${droneImages.length} Drone images.`);

    await browser.close();

    const newLegoProducts = generateProducts(legoImages, 8, 'lego');
    const newWatchProducts = generateProducts(watchImages, 8, 'watch');

    // 12 New Distinct Replacements for generic RC Cars
    const newTruckProducts = generateProducts(truckImages, 4, 'truck');
    const newRobotProducts = generateProducts(robotImages, 4, 'robot');
    const newDroneProducts = generateProducts(droneImages, 4, 'drone');

    const newVarietyProducts = [
        ...newLegoProducts,
        ...newWatchProducts,
        ...newTruckProducts,
        ...newRobotProducts,
        ...newDroneProducts
    ];

    if (newVarietyProducts.length === 0) {
        console.log('Failed to generate any new products.');
        return;
    }

    console.log(`Successfully minted ${newVarietyProducts.length} new variety products. Replacing in catalog...`);

    const productsFile = './src/lib/products.ts';
    const content = fs.readFileSync(productsFile, 'utf8');
    const match = content.match(/export const FALLBACK_PRODUCTS[^\[]*\[([\s\S]*)\];/);

    if (match) {
        let arr = eval('[' + match[1] + ']');
        console.log(`Original catalog size: ${arr.length}`);

        // We replace the first 28 slots completely (16 original varieties + 12 new distinct vehicles)
        for (let i = 0; i < newVarietyProducts.length; i++) {
            if (i < arr.length) {
                arr[i] = newVarietyProducts[i];
            } else {
                arr.push(newVarietyProducts[i]);
            }
        }

        const fallbackProductsBase = `import type { Product } from './supabase';\n\nexport const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = [\n`;
        const newContent = fallbackProductsBase + arr.map(t => JSON.stringify(t, null, 2)).join(',\\n') + '\\n];\\n';

        fs.writeFileSync(productsFile, newContent);
        console.log('Saved hyper-diverse mixed-variety products seamlessly to src/lib/products.ts!');

        const { execSync } = require('child_process');
        execSync('node purge_duplicates.js', { stdio: 'inherit' });
        console.log('Run secondary deduplication logic instantly.');
    } else {
        console.log('Could not parse products.ts');
    }
}

main().catch(console.error);
