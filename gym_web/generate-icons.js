const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 아이콘 디렉토리 생성
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG 텍스트 생성 함수
function generateSVG(size) {
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="central" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="${size * 0.5}" 
        fill="white">P</text>
    </svg>
  `;
}

// 여러 크기의 아이콘 생성
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('🎨 아이콘 생성 중...\n');
  
  for (const size of sizes) {
    const svg = generateSVG(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      console.log(`✅ icon-${size}x${size}.png 생성 완료`);
    } catch (error) {
      console.error(`❌ icon-${size}x${size}.png 생성 실패:`, error.message);
    }
  }
  
  console.log('\n🎉 모든 아이콘 생성 완료!');
  console.log(`📁 위치: ${iconsDir}`);
}

generateIcons().catch(console.error);







