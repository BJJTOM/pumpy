const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 스크린샷 디렉토리 생성
const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// SVG 스크린샷 생성
function generateScreenshotSVG() {
  return `
    <svg width="540" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- 배경 -->
      <rect width="540" height="720" fill="url(#bgGrad)"/>
      
      <!-- 상단 바 -->
      <rect x="0" y="0" width="540" height="80" fill="rgba(255,255,255,0.1)"/>
      
      <!-- 앱 제목 -->
      <text x="270" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">펌피</text>
      
      <!-- 메인 컨텐츠 카드 -->
      <rect x="40" y="120" width="460" height="200" fill="white" rx="20"/>
      <text x="270" y="180" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#333" text-anchor="middle">스마트한 체육관 관리</text>
      <text x="270" y="220" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle">회원 앱으로 운동 기록을</text>
      <text x="270" y="250" font-family="Arial, sans-serif" font-size="18" fill="#666" text-anchor="middle">쉽고 간편하게!</text>
      
      <!-- 기능 아이콘들 -->
      <circle cx="135" cy="400" r="40" fill="rgba(255,255,255,0.2)"/>
      <text x="135" y="415" font-size="40" text-anchor="middle">💪</text>
      
      <circle cx="270" cy="400" r="40" fill="rgba(255,255,255,0.2)"/>
      <text x="270" y="415" font-size="40" text-anchor="middle">📊</text>
      
      <circle cx="405" cy="400" r="40" fill="rgba(255,255,255,0.2)"/>
      <text x="405" y="415" font-size="40" text-anchor="middle">🎯</text>
      
      <!-- 텍스트 -->
      <text x="135" y="470" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">운동 기록</text>
      <text x="270" y="470" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">통계 분석</text>
      <text x="405" y="470" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">목표 달성</text>
      
      <!-- 하단 버튼 -->
      <rect x="120" y="580" width="300" height="60" fill="white" rx="30"/>
      <text x="270" y="617" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#667eea" text-anchor="middle">시작하기</text>
    </svg>
  `;
}

async function generateScreenshot() {
  console.log('📸 스크린샷 생성 중...\n');
  
  const svg = generateScreenshotSVG();
  const outputPath = path.join(screenshotsDir, 'screenshot1.png');
  
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log('✅ screenshot1.png 생성 완료');
    console.log(`📁 위치: ${outputPath}`);
  } catch (error) {
    console.error('❌ 스크린샷 생성 실패:', error.message);
  }
}

generateScreenshot().catch(console.error);







