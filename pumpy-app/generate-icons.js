const fs = require('fs');
const path = require('path');

// SVG 기반 아이콘 생성 (파란색 X 디자인)
const createIcon = (size, filename) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- 배경 (라운드 사각형) -->
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#f0f0f0"/>
    
    <!-- 그리드 패턴 (diagonal lines) -->
    <defs>
      <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="40" y2="0" stroke="#e0e0e0" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grid)" opacity="0.5"/>
    
    <!-- X 아이콘 (파란색 그라데이션) -->
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#5ec2f0;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4a9fd8;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- 왼쪽 위에서 오른쪽 아래로 -->
    <rect x="${size * 0.25}" y="${size * 0.35}" width="${size * 0.15}" height="${size * 0.5}" 
          rx="${size * 0.03}" 
          fill="url(#blueGradient)" 
          transform="rotate(45 ${size/2} ${size/2})"/>
    
    <!-- 오른쪽 위에서 왼쪽 아래로 -->
    <rect x="${size * 0.6}" y="${size * 0.35}" width="${size * 0.15}" height="${size * 0.5}" 
          rx="${size * 0.03}" 
          fill="url(#blueGradient)" 
          transform="rotate(-45 ${size/2} ${size/2})"/>
  </svg>`;

  const outputPath = path.join(__dirname, 'assets', filename);
  fs.writeFileSync(outputPath, svg);
  console.log(`✅ ${filename} 생성 완료 (${size}x${size})`);
};

// assets 디렉토리 생성
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// 아이콘 생성
console.log('🎨 앱 아이콘 생성 중...\n');

createIcon(1024, 'icon.png.svg');
createIcon(1024, 'adaptive-icon.png.svg');
createIcon(1242, 'splash.png.svg');
createIcon(48, 'favicon.png.svg');

console.log('\n✅ 모든 아이콘 생성 완료!');
console.log('\n📝 다음 단계:');
console.log('1. assets 폴더의 .svg 파일들을 온라인 변환기로 .png로 변환');
console.log('2. 또는 아래 명령어 실행:');
console.log('   npx sharp-cli -i assets/icon.png.svg -o assets/icon.png');


