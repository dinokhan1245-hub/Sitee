const fs = require('fs');

const content = fs.readFileSync('src/lib/products.ts', 'utf8');
const match = content.match(/export const FALLBACK_PRODUCTS[^\[]*\[([\s\S]*)\];/);

if (match) {
    const arr = eval('[' + match[1] + ']');
    let html = '<html><body style="background:#f0f0f0;"><div style="display:flex; flex-wrap:wrap; padding:20px;">';

    arr.forEach(p => {
        // Fix image path for local HTML viewing
        let imgSrc = p.image_url;
        if (imgSrc.startsWith('/')) imgSrc = imgSrc.substring(1);

        html += `<div style="width:200px; padding:10px; background:white; border:1px solid #ccc; margin:5px; border-radius:8px;">
            <img src="${imgSrc}" style="width:100%; height:150px; object-fit:contain;" />
            <p style="font-size:11px; font-family:sans-serif; margin-top:5px;"><strong>${p.name}</strong></p>
            <p style="font-size:10px; font-family:sans-serif; color:gray;">${p.id}</p>
        </div>`;
    });

    html += '</div></body></html>';
    fs.writeFileSync('public/visual_check.html', html);
    console.log('Successfully created public/visual_check.html with ' + arr.length + ' items.');
} else {
    console.log('Failed to parse products.ts');
}
