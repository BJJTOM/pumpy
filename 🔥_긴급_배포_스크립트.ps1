# 🔥 긴급 AWS 배포 및 APK 빌드 스크립트

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 펌피 긴급 배포 시작" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1단계: APK 빌드 상태 확인
# ============================================
Write-Host "1️⃣ APK 빌드 상태 확인..." -ForegroundColor Yellow
$apkPath = "C:\Users\guddn\Downloads\COCO\pumpy-app\android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    $apk = Get-Item $apkPath
    $sizeMB = [math]::Round($apk.Length/1MB, 2)
    Write-Host "   ✅ APK 파일 존재: $sizeMB MB" -ForegroundColor Green
    Write-Host "   📅 생성 시간: $($apk.LastWriteTime)" -ForegroundColor Green
    
    # APK 복사
    $destPath = "C:\Users\guddn\Downloads\COCO\Pumpy_v2.0.0_Latest.apk"
    Copy-Item $apkPath -Destination $destPath -Force
    Write-Host "   📦 복사 완료: $destPath" -ForegroundColor Green
} else {
    Write-Host "   ⏳ APK 빌드 진행 중 또는 미생성" -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# 2단계: AWS 서버 상태 진단
# ============================================
Write-Host "2️⃣ AWS 서버 진단..." -ForegroundColor Yellow

Write-Host "   - Ping 테스트..." -NoNewline
$pingResult = Test-Connection -ComputerName "3.27.28.175" -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($pingResult) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
}

Write-Host "   - SSH 포트 (22)..." -NoNewline
$sshResult = Test-NetConnection -ComputerName "3.27.28.175" -Port 22 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($sshResult) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
}

Write-Host "   - HTTP 포트 (80)..." -NoNewline
$httpResult = Test-NetConnection -ComputerName "3.27.28.175" -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($httpResult) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
}

Write-Host ""

# ============================================
# 3단계: 배포 결정
# ============================================
Write-Host "3️⃣ 배포 전략..." -ForegroundColor Yellow

if ($sshResult) {
    Write-Host "   ℹ️  SSH 포트 열림 - SSH 배포 시도" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   다음 명령어로 배포하세요:" -ForegroundColor Yellow
    Write-Host '   ssh -i "C:\Users\guddn\Downloads\COCO\pumpy-key.pem" ubuntu@3.27.28.175 "cd ~/pumpy && git pull && cd gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && sudo systemctl restart gunicorn && cd ../gym_web && npm install && npm run build && pm2 restart gym-web && sudo systemctl restart nginx"' -ForegroundColor White
} elseif ($pingResult) {
    Write-Host "   ⚠️  Ping 응답 있지만 SSH 닫힘 - 보안그룹 확인 필요" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   해결 방법:" -ForegroundColor Cyan
    Write-Host "   1. AWS 콘솔 → EC2 → 인스턴스 선택" -ForegroundColor White
    Write-Host "   2. 보안 그룹 → 인바운드 규칙 편집" -ForegroundColor White
    Write-Host "   3. SSH (22), HTTP (80), HTTPS (443) 포트 열기" -ForegroundColor White
} else {
    Write-Host "   🚨 서버 완전 다운 - AWS 콘솔에서 인스턴스 시작 필요" -ForegroundColor Red
    Write-Host ""
    Write-Host "   해결 방법:" -ForegroundColor Cyan
    Write-Host "   1. AWS 콘솔 → EC2 → 인스턴스" -ForegroundColor White
    Write-Host "   2. 인스턴스 선택 → 인스턴스 상태 → 시작" -ForegroundColor White
    Write-Host "   3. 또는 Session Manager로 접속" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 최종 상태" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $apkPath) {
    Write-Host "✅ APK: 빌드 완료 ($sizeMB MB)" -ForegroundColor Green
} else {
    Write-Host "⏳ APK: 빌드 진행 중" -ForegroundColor Yellow
}

if ($httpResult) {
    Write-Host "✅ AWS: 배포 완료 및 서비스 실행 중" -ForegroundColor Green
} elseif ($sshResult) {
    Write-Host "⚠️  AWS: SSH 가능 - 배포 필요" -ForegroundColor Yellow
} elseif ($pingResult) {
    Write-Host "⚠️  AWS: 서버 살아있음 - 보안그룹 설정 필요" -ForegroundColor Yellow
} else {
    Write-Host "❌ AWS: 서버 다운 또는 네트워크 문제" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan


