const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, 'assets');

// SVG를 PNG로 변환
async function convertSVGtoPNG(svgPath, pngPath, size) {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    console.log(`✅ ${path.basename(pngPath)} 생성 완료`);
  } catch (error) {
    console.error(`❌ ${path.basename(pngPath)} 생성 실패:`, error.message);
  }
}

async function main() {
  console.log('🎨 PNG 아이콘 생성 중...\n');

  await convertSVGtoPNG(
    path.join(assetsDir, 'icon.svg'),
    path.join(assetsDir, 'icon.png'),
    1024
  );

  await convertSVGtoPNG(
    path.join(assetsDir, 'splash.svg'),
    path.join(assetsDir, 'splash.png'),
    1024
  );

  await convertSVGtoPNG(
    path.join(assetsDir, 'adaptive-icon.svg'),
    path.join(assetsDir, 'adaptive-icon.png'),
    1024
  );

  await convertSVGtoPNG(
    path.join(assetsDir, 'favicon.svg'),
    path.join(assetsDir, 'favicon.png'),
    48
  );

  console.log('\n✅ 모든 PNG 아이콘이 생성되었습니다!');
}

main().catch(console.error);










