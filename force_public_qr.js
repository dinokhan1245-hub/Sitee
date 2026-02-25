const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function generate() {
    const upiUrl = 'upi://pay?pa=paytm.s208jl7@pty&pn=Paytm%20Merchant&cu=INR';

    // High quality QR code, minimal margin for clean display
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 600,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });

    // Extract the base64 data portion
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");

    // Write directly to the public folder
    const outputPath = path.join(__dirname, 'public', 'paytm_qr.png');
    fs.writeFileSync(outputPath, base64Data, 'base64');

    console.log(`Successfully hardcoded QR code to: ${outputPath}`);
}

generate().catch(console.error);
