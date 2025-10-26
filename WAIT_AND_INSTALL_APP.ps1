# 에뮬레이터 부팅 대기 및 앱 자동 설치 스크립트

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ⏳ 에뮬레이터 부팅 대기 중" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\platform-tools"

$maxWaitTime = 180 # 3분
$elapsed = 0
$bootComplete = $false

Write-Host "에뮬레이터가 완전히 부팅될 때까지 대기 중..." -ForegroundColor Yellow
Write-Host "(최대 3분 소요, 보통 30-60초)" -ForegroundColor Gray
Write-Host ""

while ($elapsed -lt $maxWaitTime) {
    # ADB 연결 확인
    $devices = adb devices 2>$null
    
    if ($devices -match "emulator-\d+\s+device") {
        Write-Host "✅ 에뮬레이터 연결됨!" -ForegroundColor Green
        
        # 부팅 완료 확인
        $bootStatus = adb shell getprop sys.boot_completed 2>$null
        
        if ($bootStatus -match "1") {
            Write-Host "✅ 부팅 완료!" -ForegroundColor Green
            $bootComplete = $true
            break
        } else {
            Write-Host "   부팅 중... ($elapsed 초 경과)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   에뮬레이터 연결 대기... ($elapsed 초 경과)" -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 5
    $elapsed += 5
}

if (-not $bootComplete) {
    Write-Host ""
    Write-Host "❌ 에뮬레이터 부팅 시간 초과" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 해결 방법:" -ForegroundColor Yellow
    Write-Host "   1. 에뮬레이터 창에서 Android 홈 화면이 보이는지 확인" -ForegroundColor White
    Write-Host "   2. 부팅이 완료되면 이 스크립트를 다시 실행" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📱 펌피 앱 설치 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# pumpy-app 폴더로 이동
Set-Location -Path "C:\Users\guddn\Downloads\COCO\pumpy-app"

Write-Host "React Native 앱 빌드 및 설치 중..." -ForegroundColor Yellow
Write-Host "(첫 빌드는 1-2분 소요될 수 있습니다)" -ForegroundColor Gray
Write-Host ""

# React Native 앱 실행
npx react-native run-android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  🎉 완료!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ 펌피 앱이 에뮬레이터에 설치되었습니다!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 개발 팁:" -ForegroundColor Cyan
    Write-Host "   - 코드 수정 후 저장하면 자동으로 반영됩니다" -ForegroundColor White
    Write-Host "   - Ctrl+M (에뮬레이터) → 개발자 메뉴" -ForegroundColor White
    Write-Host "   - R키 2번 → 수동 새로고침" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ 앱 설치 중 오류 발생" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 해결 방법:" -ForegroundColor Yellow
    Write-Host "   1. Metro 서버가 실행 중인지 확인 (다른 터미널)" -ForegroundColor White
    Write-Host "   2. 'npm start'가 실행 중이어야 합니다" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

