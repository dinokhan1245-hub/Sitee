const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const queries = [
    "LEGO Technic Mercedes-AMG F1 W14",
    "Wembley Rechargeable Remote Control Rock Crawler 4WD",
    "Expleasia 360 Degree Rotating Stunt Car",
    "Centy Toys Realistic Pull Back Innova Crysta Taxi",
    "Hot Wheels Colossal Crash Track Set",
    "LEGO Marvel Avengers Tower Collector",
    "Toyshine Premium Wooden Chess Board Game",
    "WISHKEY Transformer Robot Car"
];

async function run() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (let i = 0; i < queries.length; i++) {
        const id = i + 1;
        console.log(`\nSearching for: ${queries[i]}`);
        try {
            await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(queries[i])}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Scroll to trigger lazy loading
            await page.evaluate(async () => {
                window.scrollBy(0, window.innerHeight);
                await new Promise(r => setTimeout(r, 1000));
                window.scrollBy(0, window.innerHeight);
                await new Promise(r => setTimeout(r, 1000));
            });

            const imageUrls = await page.evaluate(() => {
                // Get all images on the page
                const allImgs = Array.from(document.querySelectorAll('img'));
                // Filter out logos, clear pixels, and tiny UI icons. Keep only product images.
                const productSrcs = allImgs
                    .map(img => img.src || "")
                    .filter(src => src.includes('rukminim2.flixcart.com') && !src.includes('logo') && !src.includes('fk-p-') && src.includes('image'));

                // Try to upgrade resolution from 612/612 or whatever to 832/832
                const highRes = productSrcs.map(src => src.replace(/\/\d+\/\d+\//, '/832/832/'));

                // Unique array
                const unique = [...new Set(highRes)];
                return unique.slice(0, 4);
            });

            console.log(`Found ${imageUrls.length} relevant images from the search page.`);

            for (let j = 0; j < 4; j++) {
                const imgUrl = imageUrls[j] || imageUrls[0]; // fallback to first if less than 4 found
                if (!imgUrl) {
                    console.log('No image URL available to download.');
                    continue;
                }

                const destPath = path.join(__dirname, 'public', 'images', 'products', `${id}_${j + 1}.jpeg`);
                console.log(`Downloading ${j + 1} to ${destPath}`);

                try {
                    const base64Data = await page.evaluate(async (url) => {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    }, imgUrl);

                    const base64Image = base64Data.split(';base64,').pop();
                    fs.writeFileSync(destPath, base64Image, { encoding: 'base64' });
                } catch (e) {
                    console.log(`Failed to download: ${e.message}`);
                    // write transparent 1x1
                    fs.writeFileSync(destPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
                }
            }

        } catch (e) {
            console.log(`Error processing ${queries[i]}: ${e.message}`);
        }
    }

    await browser.close();
    console.log('All done!');
}

run().catch(console.error);
