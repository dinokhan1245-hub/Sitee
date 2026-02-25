const QRCode = require('qrcode');
const fs = require('fs');

async function generate() {
    const upiUrl = 'upi://pay?pa=paytm.s208jl7@pty&pn=Paytm%20Merchant&cu=INR';
    const qrDataUrl = await QRCode.toDataURL(upiUrl, { errorCorrectionLevel: 'H', margin: 1, width: 400 });

    const sql = `
-- Run this EXACT command in the Supabase SQL Editor to forcefully save your Paytm QR code!
DELETE FROM settings WHERE id IN ('qr_code_file', 'qr_code_url', 'qr_code');
INSERT INTO settings (id, value) VALUES ('qr_code_file', '${qrDataUrl}');
`;

    fs.writeFileSync('paytm_qr.sql', sql.trim());
    console.log('SQL generated successfully.');
}

generate();
