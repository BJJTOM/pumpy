// 간단한 아이콘 생성 스크립트
// 실제로는 디자인된 아이콘을 사용하세요

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const iconSVG = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#grad1)" rx="200"/>
  <text x="512" y="650" font-family="Arial, sans-serif" font-size="600" font-weight="bold" fill="white" text-anchor="middle">P</text>
</svg>
`;

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSVG);

console.log('✅ 아이콘 파일이 생성되었습니다: assets/icon.svg');
console.log('');
console.log('📝 다음 단계:');
console.log('1. icon.svg를 PNG로 변환:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - 1024x1024 크기로 변환');
console.log('2. 변환된 PNG를 다음 파일명으로 저장:');
console.log('   - assets/icon.png');
console.log('   - assets/splash.png');
console.log('   - assets/adaptive-icon.png');
console.log('   - assets/favicon.png');
console.log('');
console.log('또는 직접 디자인된 아이콘을 사용하세요!');










