# COCO 체육관 관리 시스템 - 자동 배포 스크립트

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  COCO 체육관 관리 시스템" -ForegroundColor Green
Write-Host "  자동 배포 시작..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 백엔드 터널 시작
Write-Host "[1/4] 백엔드 터널 생성 중..." -ForegroundColor Yellow
$backendTunnelJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\guddn\Downloads\COCO"
    & lt --port 8000 2>&1
}

Start-Sleep -Seconds 5

# 백엔드 URL 추출
$backendUrl = ""
$maxAttempts = 15
$attempt = 0

while ($backendUrl -eq "" -and $attempt -lt $maxAttempts) {
    $jobOutput = Receive-Job -Job $backendTunnelJob -ErrorAction SilentlyContinue | Out-String
    if ($jobOutput -match "https://[a-z0-9-]+\.loca\.lt") {
        $backendUrl = $matches[0]
        Write-Host "   ✓ 백엔드 URL: " -NoNewline -ForegroundColor Green
        Write-Host $backendUrl -ForegroundColor White
        break
    }
    Start-Sleep -Seconds 1
    $attempt++
}

if ($backendUrl -eq "") {
    Write-Host "   ✗ 백엔드 터널 생성 실패" -ForegroundColor Red
    Write-Host ""
    Write-Host "수동으로 URL을 확인하세요:" -ForegroundColor Yellow
    Write-Host "  1. 새 PowerShell 창에서: lt --port 8000" -ForegroundColor White
    Write-Host "  2. 표시되는 URL을 복사" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host ""

# 2. 프론트엔드 터널 시작
Write-Host "[2/4] 프론트엔드 터널 생성 중..." -ForegroundColor Yellow
$frontendTunnelJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\guddn\Downloads\COCO"
    & lt --port 3000 2>&1
}

Start-Sleep -Seconds 5

# 프론트엔드 URL 추출
$frontendUrl = ""
$attempt = 0

while ($frontendUrl -eq "" -and $attempt -lt $maxAttempts) {
    $jobOutput = Receive-Job -Job $frontendTunnelJob -ErrorAction SilentlyContinue | Out-String
    if ($jobOutput -match "https://[a-z0-9-]+\.loca\.lt") {
        $frontendUrl = $matches[0]
        Write-Host "   ✓ 프론트엔드 URL: " -NoNewline -ForegroundColor Green
        Write-Host $frontendUrl -ForegroundColor White
        break
    }
    Start-Sleep -Seconds 1
    $attempt++
}

if ($frontendUrl -eq "") {
    Write-Host "   ✗ 프론트엔드 터널 생성 실패" -ForegroundColor Red
    Write-Host ""
    Write-Host "수동으로 URL을 확인하세요:" -ForegroundColor Yellow
    Write-Host "  1. 새 PowerShell 창에서: lt --port 3000" -ForegroundColor White
    Write-Host "  2. 표시되는 URL을 복사" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host ""

# 3. 프론트엔드 재시작
Write-Host "[3/4] 프론트엔드 재시작 중..." -ForegroundColor Yellow
Write-Host "   - Node 프로세스 중지 중..." -ForegroundColor Gray

# Node 프로세스 중지
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -notmatch "LocalTunnel" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "   - 환경 변수 설정 중..." -ForegroundColor Gray
Write-Host "     NEXT_PUBLIC_API_BASE=$backendUrl/api" -ForegroundColor DarkGray

# 프론트엔드 재시작
Write-Host "   - Next.js 서버 시작 중..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'COCO Frontend Server';
Write-Host '==================================' -ForegroundColor Cyan;
Write-Host '  COCO 프론트엔드 서버' -ForegroundColor Green;
Write-Host '==================================' -ForegroundColor Cyan;
Write-Host '';
Write-Host '백엔드 API: $backendUrl/api' -ForegroundColor Yellow;
Write-Host '';
cd C:\Users\guddn\Downloads\COCO\gym_web;
`$env:NEXT_PUBLIC_API_BASE='$backendUrl/api';
npm run dev
"@

Start-Sleep -Seconds 5

Write-Host ""

# 4. URL 정보 저장
Write-Host "[4/4] 접속 정보 저장 중..." -ForegroundColor Yellow

$accessInfo = @"
==========================================
🎉 COCO 체육관 관리 시스템
인터넷 배포 완료!
==========================================

생성 시간: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

📱 접속 URL (전세계 어디서나 접속 가능!)
------------------------------------------

► 관리자 대시보드
  $frontendUrl

► 회원용 앱
  $frontendUrl/app

► 회원 가입 페이지
  $frontendUrl/signup


🔧 기술 정보
------------------------------------------

백엔드 API: $backendUrl/api
프론트엔드: $frontendUrl

로컬 백엔드: http://localhost:8000
로컬 프론트엔드: http://localhost:3000


💡 첫 접속 시 안내
------------------------------------------

LocalTunnel 보안 화면이 나오면:
1. "Remind me" 또는 "Continue" 클릭
2. Tunnel Password 입력 (아무거나 입력)
3. "Submit" 클릭

이후부터는 바로 접속됩니다!


📱 친구에게 공유하기
------------------------------------------

URL을 복사하여 카카오톡, SMS 등으로 공유하세요!

카카오톡 메시지 예시:
"내가 만든 체육관 관리 서비스야! 🏋️
👉 $frontendUrl
한번 들어와봐!"


🛑 종료 방법
------------------------------------------

1. 이 창 닫기 (Ctrl + C)
2. 열린 PowerShell 창들 닫기
3. 또는 터널만 유지하고 이 창만 닫기


==========================================
🎊 축하합니다!
전세계 어디서나 접속 가능합니다!
==========================================
"@

$accessInfo | Out-File -FilePath "C:\Users\guddn\Downloads\COCO\✅_접속URL.txt" -Encoding UTF8

Write-Host "   ✓ 접속 정보가 저장되었습니다!" -ForegroundColor Green
Write-Host "     파일: ✅_접속URL.txt" -ForegroundColor DarkGray

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  🎉 배포 완료!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 접속 URL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ► 관리자 대시보드" -ForegroundColor Cyan
Write-Host "    $frontendUrl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "  ► 회원용 앱" -ForegroundColor Cyan
Write-Host "    $frontendUrl/app" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "  ► 회원 가입" -ForegroundColor Cyan
Write-Host "    $frontendUrl/signup" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: URL을 클립보드에 복사하려면..." -ForegroundColor Yellow
Write-Host "   Set-Clipboard -Value '$frontendUrl'" -ForegroundColor White
Write-Host ""
Write-Host "🌐 브라우저로 열기..." -ForegroundColor Yellow
Start-Process $frontendUrl
Write-Host ""
Write-Host "이 창을 닫으면 터널이 종료됩니다." -ForegroundColor Red
Write-Host "터널을 유지하려면 이 창을 열어두세요!" -ForegroundColor Yellow
Write-Host ""
Write-Host "종료하려면 아무 키나 누르세요..." -ForegroundColor Gray

# 터널 유지
$null = Wait-Job -Job $backendTunnelJob, $frontendTunnelJob -Timeout 1

# 무한 대기
while ($true) {
    if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        Write-Host ""
        Write-Host "터널을 종료하는 중..." -ForegroundColor Yellow
        Stop-Job -Job $backendTunnelJob, $frontendTunnelJob -ErrorAction SilentlyContinue
        Remove-Job -Job $backendTunnelJob, $frontendTunnelJob -ErrorAction SilentlyContinue
        Write-Host "✓ 종료되었습니다." -ForegroundColor Green
        break
    }
    Start-Sleep -Milliseconds 100
}



