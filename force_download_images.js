const fs = require('fs');
const https = require('https');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images', 'products');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

// Stable, high-quality toy car images from Unsplash that won't 403 block us
const fallbacks = [
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
];

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        };

        https.get(url, options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // follow redirect for unsplash
                https.get(res.headers.location, options, (redirectRes) => {
                    if (redirectRes.statusCode === 200) {
                        redirectRes.pipe(fs.createWriteStream(filepath))
                            .on('error', reject)
                            .once('close', () => resolve(filepath));
                    } else {
                        reject(new Error(`Redirect Failed: ${redirectRes.statusCode}`));
                    }
                });
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function fixProducts() {
    const productsFile = './src/lib/products.ts';
    let content = fs.readFileSync(productsFile, 'utf8');

    const numImages = 4;
    const localFiles = fallbacks.map((url, i) => `unsplash_toy_${i + 1}.jpeg`);

    // Download them
    for (let i = 0; i < fallbacks.length; i++) {
        const filepath = path.join(imgDir, localFiles[i]);
        try {
            await downloadImage(fallbacks[i], filepath);
            console.log(`Successfully downloaded ${localFiles[i]}`);
        } catch (e) {
            console.error(`Failed to download ${localFiles[i]}: ${e.message}`);
        }
    }

    // Set all prices to 99 across the entire catalog
    content = content.replace(/"price":\s*\d+/g, '"price": 99');

    // Replace the 4 broken flipkart paths with the unsplash local paths
    // The previous script left "/images/products/fallback_toy_X.jpeg" in the file
    content = content.replace(/\/images\/products\/fallback_toy_1\.jpeg/g, `/images/products/${localFiles[0]}`);
    content = content.replace(/\/images\/products\/fallback_toy_2\.jpeg/g, `/images/products/${localFiles[1]}`);
    content = content.replace(/\/images\/products\/fallback_toy_3\.jpeg/g, `/images/products/${localFiles[2]}`);
    content = content.replace(/\/images\/products\/fallback_toy_4\.jpeg/g, `/images/products/${localFiles[3]}`);

    // Just in case it's still missing any images (empty strings or empty arrays)
    content = content.replace(/"image_url":\s*""/g, () => '\"image_url\": \"/images/products/unsplash_toy_1.jpeg\"');
    content = content.replace(/"images":\s*\[\]/g, () => `"images": [\n      "/images/products/unsplash_toy_1.jpeg"\n    ]`);

    fs.writeFileSync(productsFile, content);
    console.log('Successfully updated prices to 99 and localized all image paths using Unsplash!');
}

fixProducts().catch(console.error);
