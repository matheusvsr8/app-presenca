const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');

const logoBuffer = fs.readFileSync(logoPath);
const base64Data = logoBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64Data}`;

// 1. Cria o SVG standalone com o Base64 embutido (100% visível em qualquer navegador)
const svgContent = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="favClip">
      <rect width="64" height="64" rx="14" />
    </clipPath>
  </defs>
  <rect width="64" height="64" rx="14" fill="#05070a" stroke="#00d95f" stroke-width="2"/>
  <image href="${dataUri}" width="64" height="64" clip-path="url(#favClip)" preserveAspectRatio="xMidYMid slice" />
</svg>`;

fs.writeFileSync(svgPath, svgContent);

// 2. Copia para favicon.ico (fallback universal)
fs.writeFileSync(icoPath, logoBuffer);

console.log('Favicons atualizados com sucesso com base64 embutido!');
