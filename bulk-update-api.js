const fs = require('fs');
const path = require('path');

const files = [
  'gym_web/app/schedule/page.tsx',
  'gym_web/app/analytics/page.tsx',
  'gym_web/app/plans/page.tsx',
  'gym_web/app/coaches/page.tsx',
  'gym_web/app/wods/page.tsx',
  'gym_web/app/revenue/page.tsx',
  'gym_web/app/lockers/page.tsx',
  'gym_web/app/attendance/page.tsx',
  'gym_web/app/app/profile/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // API_BASE 패턴을 모두 getApiUrl()로 변경
    content = content.replace(
      /const hostname = window\.location\.hostname[\s\S]*?apiBase = `http:\/\/\$\{hostname\}:8000\/api`[\s\S]*?\}/g,
      'const apiBase = getApiUrl()'
    );
    
    // localhost 체크 패턴도 변경
    content = content.replace(
      /const hostname = window\.location\.hostname\s*\n\s*const apiBase = \(hostname !== 'localhost' && hostname !== '127\.0\.0\.1'\)\s*\n\s*\? `http:\/\/\$\{hostname\}:8000\/api`\s*\n\s*: API_BASE/g,
      'const apiBase = getApiUrl()'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});

console.log('All files updated!');










