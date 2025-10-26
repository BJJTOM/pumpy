# Android 환경 변수 자동 설정 스크립트
# 관리자 권한 필요

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🤖 Android 환경 변수 자동 설정" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# SDK 경로 확인
$AndroidHome = "$env:LOCALAPPDATA\Android\Sdk"

if (Test-Path $AndroidHome) {
    Write-Host "✅ Android SDK 발견: $AndroidHome" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK를 찾을 수 없습니다." -ForegroundColor Red
    Write-Host "   Android Studio를 먼저 설치해주세요." -ForegroundColor Yellow
    Write-Host "   또는 SDK 경로를 수동으로 입력하세요:" -ForegroundColor Yellow
    $AndroidHome = Read-Host "   SDK 경로"
    
    if (-not (Test-Path $AndroidHome)) {
        Write-Host "❌ 경로가 존재하지 않습니다. 스크립트를 종료합니다." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📝 환경 변수 설정 중..." -ForegroundColor Yellow

try {
    # ANDROID_HOME 설정 (시스템 변수)
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidHome, "Machine")
    Write-Host "✅ ANDROID_HOME 설정 완료" -ForegroundColor Green
    
    # PATH에 추가할 경로들
    $PathsToAdd = @(
        "$AndroidHome\platform-tools",
        "$AndroidHome\emulator",
        "$AndroidHome\tools",
        "$AndroidHome\tools\bin"
    )
    
    # 현재 PATH 가져오기
    $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    # 각 경로 추가
    foreach ($PathToAdd in $PathsToAdd) {
        if ($CurrentPath -notlike "*$PathToAdd*") {
            $CurrentPath += ";$PathToAdd"
            Write-Host "✅ PATH에 추가: $PathToAdd" -ForegroundColor Green
        } else {
            Write-Host "⏭️  이미 존재: $PathToAdd" -ForegroundColor Gray
        }
    }
    
    # PATH 업데이트
    [Environment]::SetEnvironmentVariable("Path", $CurrentPath, "Machine")
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 환경 변수 설정 완료!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  중요: PowerShell을 재시작해야 적용됩니다!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "확인 명령어:" -ForegroundColor Cyan
    Write-Host "  `$env:ANDROID_HOME" -ForegroundColor White
    Write-Host "  adb --version" -ForegroundColor White
    Write-Host "  emulator -list-avds" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 해결 방법:" -ForegroundColor Yellow
    Write-Host "   1. PowerShell을 '관리자 권한'으로 실행" -ForegroundColor White
    Write-Host "   2. 이 스크립트를 다시 실행" -ForegroundColor White
    Write-Host ""
    Write-Host "   또는 수동 설정:" -ForegroundColor Yellow
    Write-Host "   - Windows 검색: '환경 변수'" -ForegroundColor White
    Write-Host "   - 시스템 환경 변수 편집" -ForegroundColor White
    Write-Host "   - ANDROID_HOME: $AndroidHome" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

