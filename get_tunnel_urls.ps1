# LocalTunnel URL 자동 생성 및 확인 스크립트

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  COCO 체육관 관리 시스템" -ForegroundColor Green
Write-Host "  인터넷 접속 URL 생성 중..." -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 백엔드 터널 생성 (백그라운드)
Write-Host "[1/3] 백엔드 터널 생성 중..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\guddn\Downloads\COCO"
    $output = & lt --port 8000 2>&1
    $output
}

Start-Sleep -Seconds 3

# 백엔드 URL 확인
$backendUrl = ""
$attempts = 0
while ($backendUrl -eq "" -and $attempts -lt 10) {
    $jobOutput = Receive-Job -Job $backendJob 2>&1 | Out-String
    if ($jobOutput -match "https://[a-z0-9-]+\.loca\.lt") {
        $backendUrl = $matches[0]
        Write-Host "✓ 백엔드 URL: $backendUrl" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $attempts++
}

if ($backendUrl -eq "") {
    Write-Host "✗ 백엔드 터널 생성 실패. 수동으로 생성해주세요." -ForegroundColor Red
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob
    exit 1
}

Write-Host ""
Write-Host "[2/3] 프론트엔드 환경 변수 설정 중..." -ForegroundColor Yellow

# 프론트엔드 터널 생성 (백그라운드)
Write-Host "[3/3] 프론트엔드 터널 생성 중..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\guddn\Downloads\COCO"
    $output = & lt --port 3000 2>&1
    $output
}

Start-Sleep -Seconds 3

# 프론트엔드 URL 확인
$frontendUrl = ""
$attempts = 0
while ($frontendUrl -eq "" -and $attempts -lt 10) {
    $jobOutput = Receive-Job -Job $frontendJob 2>&1 | Out-String
    if ($jobOutput -match "https://[a-z0-9-]+\.loca\.lt") {
        $frontendUrl = $matches[0]
        Write-Host "✓ 프론트엔드 URL: $frontendUrl" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $attempts++
}

if ($frontendUrl -eq "") {
    Write-Host "✗ 프론트엔드 터널 생성 실패. 수동으로 생성해주세요." -ForegroundColor Red
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  🎉 배포 완료!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 접속 URL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ► 관리자 대시보드" -ForegroundColor Cyan
Write-Host "    $frontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "  ► 회원용 앱" -ForegroundColor Cyan
Write-Host "    $frontendUrl/app" -ForegroundColor White
Write-Host ""
Write-Host "  ► 회원 가입 페이지" -ForegroundColor Cyan
Write-Host "    $frontendUrl/signup" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ 중요: 프론트엔드를 재시작해야 합니다!" -ForegroundColor Red
Write-Host ""
Write-Host "다음 명령어를 실행하세요:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Stop-Process -Name node -Force" -ForegroundColor White
Write-Host "  cd C:\Users\guddn\Downloads\COCO\gym_web" -ForegroundColor White
Write-Host "  `$env:NEXT_PUBLIC_API_BASE=`"$backendUrl/api`"" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: 첫 접속 시 보안 화면이 나오면 'Continue' 클릭!" -ForegroundColor Yellow
Write-Host ""

# URL을 파일로 저장
$urlInfo = @"
=================================
COCO 체육관 관리 시스템
접속 정보
=================================

생성 시간: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

📱 접속 URL:

► 관리자 대시보드
  $frontendUrl

► 회원용 앱
  $frontendUrl/app

► 회원 가입 페이지
  $frontendUrl/signup

=================================
기술 정보
=================================

백엔드 API: $backendUrl/api
프론트엔드: $frontendUrl

로컬 백엔드: http://localhost:8000
로컬 프론트엔드: http://localhost:3000

=================================

⚠️ 중요: 프론트엔드 재시작 필요

1. Node 프로세스 중지:
   Stop-Process -Name node -Force

2. 환경 변수 설정 후 재시작:
   cd C:\Users\guddn\Downloads\COCO\gym_web
   `$env:NEXT_PUBLIC_API_BASE="$backendUrl/api"
   npm run dev

=================================
"@

$urlInfo | Out-File -FilePath "C:\Users\guddn\Downloads\COCO\ACCESS_URLS.txt" -Encoding UTF8

Write-Host "✓ 접속 정보가 ACCESS_URLS.txt 파일에 저장되었습니다!" -ForegroundColor Green
Write-Host ""

# 터널 유지
Write-Host "터널이 활성화되어 있습니다. 종료하려면 이 창을 닫으세요." -ForegroundColor Cyan
Write-Host ""

# 백그라운드 작업 유지
Wait-Job -Job $backendJob, $frontendJob








