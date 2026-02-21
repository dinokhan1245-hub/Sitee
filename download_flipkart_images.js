const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const queries = [
    "LEGO Technic Mercedes-AMG F1 W14",
    "Wembley Rechargeable Remote Control Rock Crawler",
    "Expleasia 360 Degree Rotating Stunt Car",
    "Centy Toys Realistic Pull Back Innova Crysta Taxi",
    "Hot Wheels Colossal Crash Track Set with Dual Loop",
    "LEGO Marvel Avengers Tower Collector's Edition",
    "Toyshine Premium Wooden Chess Board Game Set",
    "WISHKEY Transformer Robot Car"
];

async function downloadImages() {
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
            await new Promise(r => setTimeout(r, 2000));

            const link = await page.evaluate(() => {
                const anchor = document.querySelector('div[data-id] a, a._1fQZEK, a.VJA3rP, a.CGtC98');
                return anchor ? anchor.href : null;
            });

            if (!link) {
                console.log('No products found for this query. Skipping.');
                continue;
            }

            console.log(`Found product link. Scraping images...`);
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000));

            const imageUrls = await page.evaluate(() => {
                const imgs = [];
                const elements = document.querySelectorAll('ul.Zq-k_r img, div.vXRm-m img, img.q6DClP, div._1A_Q_r img');
                elements.forEach(el => {
                    let src = el.getAttribute('src') || el.getAttribute('data-src');
                    if (src && !src.includes('data:image') && !src.includes('placeholder')) {
                        src = src.replace(/\/\d+\/\d+\//, '/832/832/');
                        if (!imgs.includes(src)) imgs.push(src);
                    }
                });
                return imgs.slice(0, 4);
            });

            console.log(`Extracted URLs: ${imageUrls.length}`);

            for (let j = 0; j < imageUrls.length; j++) {
                const imgUrl = imageUrls[j];
                const destPath = path.join(__dirname, 'public', 'images', 'products', `${id}_${j + 1}.jpeg`);

                console.log(`Downloading image ${j + 1} to ${destPath}`);
                try {
                    // Use evaluate to fetch as blob inside browser context and return base64, bypassing all Referer/CORS blocks!
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
                    console.log(`Success!`);
                } catch (e) {
                    console.log(`Failed to rip image: ${e.message}`);
                }
            }

        } catch (e) {
            console.log(`Error processing ${queries[i]}: ${e.message}`);
        }
    }

    await browser.close();
    console.log('All done!');
}

downloadImages().catch(console.error);
