# APK 빌드 스크립트 - PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📱 펌피 APK 빌드 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "현재 위치: $currentDir" -ForegroundColor Gray
Write-Host ""

# PumpyApp 디렉토리로 이동
Set-Location -Path "PumpyApp"

Write-Host "[1/5] API URL 확인 중..." -ForegroundColor Yellow
$apiConfig = Get-Content "src\utils\api.ts" -Raw
if ($apiConfig -match "3.27.28.175") {
    Write-Host "   ✅ AWS 서버 URL 설정 확인" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  경고: AWS 서버 URL이 설정되지 않았습니다" -ForegroundColor Red
}
Write-Host ""

Write-Host "[2/5] Node 모듈 설치 확인 중..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "   Node 모듈 설치 중..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "   ✅ Node 모듈 확인 완료" -ForegroundColor Green
}
Write-Host ""

Write-Host "[3/5] Android 디렉토리로 이동 중..." -ForegroundColor Yellow
Set-Location -Path "android"
Write-Host ""

Write-Host "[4/5] 이전 빌드 정리 중..." -ForegroundColor Yellow
.\gradlew.bat clean
Write-Host ""

Write-Host "[5/5] Release APK 빌드 중..." -ForegroundColor Yellow
Write-Host "   ⏱️  이 작업은 5-10분 정도 걸릴 수 있습니다..." -ForegroundColor Gray
.\gradlew.bat assembleRelease

Write-Host ""

# APK 파일 확인
$apkPath = "app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ APK 빌드 성공!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # APK 파일 크기 확인
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "📦 APK 파일 정보:" -ForegroundColor Cyan
    Write-Host "   위치: android\$apkPath" -ForegroundColor White
    Write-Host "   크기: $([math]::Round($apkSize, 2)) MB" -ForegroundColor White
    Write-Host ""
    
    # 루트 디렉토리로 복사
    $rootPath = "..\..\"
    $destFile = "Pumpy_v2.2_Latest.apk"
    Copy-Item $apkPath "$rootPath\$destFile" -Force
    Write-Host "   ✅ APK 파일이 루트 디렉토리로 복사되었습니다" -ForegroundColor Green
    Write-Host "   파일명: $destFile" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📱 설치 방법:" -ForegroundColor Cyan
    Write-Host "   1. $destFile 파일을 스마트폰으로 전송" -ForegroundColor White
    Write-Host "   2. 파일을 탭하여 설치" -ForegroundColor White
    Write-Host "   3. '출처를 알 수 없는 앱' 설치 허용" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ APK 빌드 실패" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "위 오류 메시지를 확인해주세요." -ForegroundColor Yellow
}

# 원래 디렉토리로 복귀
Set-Location -Path $currentDir









