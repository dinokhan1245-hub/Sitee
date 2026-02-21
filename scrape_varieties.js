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

    console.log('Scraping 32 distinct LEGO images...');
    const legoImages = await scrapeCategory(page, 'lego building blocks toys for kids', 32);
    console.log(`Grabbed ${legoImages.length} Lego images.`);

    console.log('Scraping 32 distinct Smartwatch images...');
    const watchImages = await scrapeCategory(page, 'kids smart watch digital', 32);
    console.log(`Grabbed ${watchImages.length} Watch images.`);

    await browser.close();

    const newLegoProducts = generateProducts(legoImages, 8, 'lego');
    const newWatchProducts = generateProducts(watchImages, 8, 'watch');
    const newVarietyProducts = [...newLegoProducts, ...newWatchProducts];

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

        // Replace the first 16 items
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
        console.log('Saved updated mixed-variety products perfectly to src/lib/products.ts!');

        // Execute generate_sql.js to rebuild Supabase seeder
        const { execSync } = require('child_process');
        execSync('node generate_sql.js', { stdio: 'inherit' });
        console.log('SQL generated automatically.');
    } else {
        console.log('Could not parse products.ts');
    }
}

main().catch(console.error);
