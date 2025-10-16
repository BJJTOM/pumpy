const fs = require('fs');
const path = require('path');

// Canvas가 없으므로 간단한 SVG 생성
const createIcon = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size/6}"/>
  <text x="${size/2}" y="${size*0.65}" font-family="Arial" font-size="${size*0.6}" font-weight="bold" fill="white" text-anchor="middle">P</text>
</svg>`;
};

const assetsDir = path.join(__dirname, 'assets');

// 아이콘 파일들 생성
const iconSVG = createIcon(1024);
const splashSVG = createIcon(1024);

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSVG);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSVG);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), iconSVG);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), createIcon(48));

console.log('✅ 아이콘 SVG 파일들이 생성되었습니다!');
console.log('');
console.log('⚠️  주의: EAS Build는 PNG 파일이 필요합니다.');
console.log('SVG를 PNG로 변환하거나, 임시로 빌드를 진행합니다.');


