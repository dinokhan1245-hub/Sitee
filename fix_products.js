const fs = require('fs');

const productsFile = './src/lib/products.ts';
let content = fs.readFileSync(productsFile, 'utf8');

const fallbacks = [
    'https://rukminim2.flixcart.com/image/832/832/xif0q/remote-control-toy/g/g/r/famous-car-steering-wheel-remote-control-car-for-kids-best-gift-original-imahyg3ygyvhyyzx.jpeg',
    'https://rukminim2.flixcart.com/image/832/832/xif0q/remote-control-toy/b/e/9/fast-modern-car-with-3d-light-remote-control-unbreakable-car-original-imahfp688euyz3n6.jpeg',
    'https://rukminim2.flixcart.com/image/832/832/xif0q/remote-control-toy/p/l/q/1-18-scale-remote-control-rock-crawler-2wd-off-road-rc-monster-original-imahfjx8g5y3zhb9.jpeg',
    'https://rukminim2.flixcart.com/image/832/832/xif0q/remote-control-toy/1/8/u/rechargeable-remote-control-rock-crawler-2-4-ghz-4wd-with-original-imahypggy94hh3zx.jpeg'
];

content = content.replace(/"image_url":\s*""/g, () => '\"image_url\": \"' + fallbacks[Math.floor(Math.random() * fallbacks.length)] + '\"');

content = content.replace(/"images":\s*\[\]/g, () => {
    const img = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return `"images": [\n      "${img}",\n      "${img}",\n      "${img}"\n    ]`;
});

fs.writeFileSync(productsFile, content);
console.log('Fixed empty images in products.ts');
