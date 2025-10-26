# API import를 업데이트하는 스크립트

$files = @(
    "gym_web\app\members\page.tsx",
    "gym_web\app\members\[id]\page.tsx",
    "gym_web\app\members\new\page.tsx",
    "gym_web\app\pending\page.tsx",
    "gym_web\app\signup\page.tsx",
    "gym_web\app\schedule\page.tsx",
    "gym_web\app\analytics\page.tsx",
    "gym_web\app\plans\page.tsx",
    "gym_web\app\coaches\page.tsx",
    "gym_web\app\wods\page.tsx",
    "gym_web\app\revenue\page.tsx",
    "gym_web\app\lockers\page.tsx",
    "gym_web\app\attendance\page.tsx",
    "gym_web\app\app\profile\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating: $file"
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # API_BASE import를 getApiUrl import로 변경
        $content = $content -replace "import axios from 'axios'`r?`n`r?`nconst API_BASE = process\.env\.NEXT_PUBLIC_API_BASE \|\| 'http://localhost:8000/api'", "import axios from 'axios'`nimport { getApiUrl } from '@/lib/api'"
        
        # 동적 API 주소 설정 패턴을 getApiUrl()로 변경
        $content = $content -replace "const hostname = window\.location\.hostname[\s\S]*?apiBase = ``http://\$\{hostname\}:8000/api``[\s\S]*?}", "const apiBase = getApiUrl()"
        
        # API_BASE 직접 사용을 getApiUrl()로 변경
        $content = $content -replace "``\$\{API_BASE\}/", "```${getApiUrl()}/"
        $content = $content -replace "`${API_BASE}/", "`${getApiUrl()}/"
        
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
    }
}

Write-Host "`nAll files updated!"










