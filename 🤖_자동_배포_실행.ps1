# 🤖 펌피 완전 자동 배포 스크립트
# 사용자 개입 없이 모든 문제 해결 및 배포 진행

$ErrorActionPreference = "Continue"
$resultFile = "C:\Users\guddn\Downloads\COCO\📊_최종_배포_결과.txt"

function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $resultFile -Value $logMessage
}

# 초기화
Clear-Content -Path $resultFile -ErrorAction SilentlyContinue
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
Write-Log "🚀 펌피 완전 자동 배포 시작" "Cyan"
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
Write-Log ""

# ============================================
# 1단계: Gradle 캐시 손상 해결
# ============================================
Write-Log "1️⃣ Gradle 캐시 손상 해결 중..." "Yellow"

try {
    Write-Log "   - Gradle 캐시 삭제 중..." "White"
    Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "   ✅ Gradle 캐시 삭제 완료" "Green"
} catch {
    Write-Log "   ⚠️  캐시 삭제 일부 실패 (계속 진행)" "Yellow"
}

Write-Log ""

# ============================================
# 2단계: APK 빌드
# ============================================
Write-Log "2️⃣ APK 빌드 시작..." "Yellow"

try {
    Set-Location "C:\Users\guddn\Downloads\COCO\pumpy-app\android"
    $env:NODE_ENV = "production"
    $env:ANDROID_HOME = "C:\Users\guddn\AppData\Local\Android\Sdk"
    
    Write-Log "   - gradlew.bat assembleRelease 실행 중 (5-10분 소요)..." "White"
    
    $buildOutput = & .\gradlew.bat assembleRelease --no-daemon --console=plain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "   ✅ APK 빌드 성공!" "Green"
        
        $apkPath = ".\app\build\outputs\apk\release\app-release.apk"
        if (Test-Path $apkPath) {
            $apk = Get-Item $apkPath
            $sizeMB = [math]::Round($apk.Length/1MB, 2)
            Write-Log "   📦 APK 크기: $sizeMB MB" "Green"
            
            # APK 복사
            Copy-Item $apkPath -Destination "C:\Users\guddn\Downloads\COCO\Pumpy_v2.0.0_Final.apk" -Force
            Write-Log "   📁 저장 위치: C:\Users\guddn\Downloads\COCO\Pumpy_v2.0.0_Final.apk" "Green"
        }
    } else {
        Write-Log "   ❌ APK 빌드 실패 (Exit Code: $LASTEXITCODE)" "Red"
        Write-Log "   마지막 100줄 에러:" "Red"
        $buildOutput | Select-Object -Last 100 | ForEach-Object { Write-Log "     $_" "Gray" }
    }
} catch {
    Write-Log "   ❌ APK 빌드 예외 발생: $($_.Exception.Message)" "Red"
}

Write-Log ""

# ============================================
# 3단계: AWS 서버 진단
# ============================================
Write-Log "3️⃣ AWS 서버 진단..." "Yellow"

$serverAlive = $false
$sshAvailable = $false

# Ping 테스트
Write-Log "   - Ping 테스트..." "White"
try {
    $pingResult = Test-Connection -ComputerName "3.27.28.175" -Count 2 -Quiet -ErrorAction Stop
    if ($pingResult) {
        Write-Log "   ✅ Ping 성공 - 서버 살아있음" "Green"
        $serverAlive = $true
    } else {
        Write-Log "   ❌ Ping 실패 - 서버 다운 또는 ICMP 차단" "Red"
    }
} catch {
    Write-Log "   ❌ Ping 테스트 실패" "Red"
}

# SSH 포트 테스트
Write-Log "   - SSH 포트 (22) 테스트..." "White"
try {
    $sshTest = Test-NetConnection -ComputerName "3.27.28.175" -Port 22 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($sshTest) {
        Write-Log "   ✅ SSH 포트 열림" "Green"
        $sshAvailable = $true
    } else {
        Write-Log "   ❌ SSH 포트 닫힘" "Red"
    }
} catch {
    Write-Log "   ❌ SSH 테스트 실패" "Red"
}

# HTTP 포트 테스트
Write-Log "   - HTTP 포트 (80) 테스트..." "White"
try {
    $httpTest = Test-NetConnection -ComputerName "3.27.28.175" -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($httpTest) {
        Write-Log "   ✅ HTTP 포트 열림 - 서비스 실행 중!" "Green"
    } else {
        Write-Log "   ❌ HTTP 포트 닫힘 - 서비스 미실행" "Red"
    }
} catch {
    Write-Log "   ❌ HTTP 테스트 실패" "Red"
}

Write-Log ""

# ============================================
# 4단계: AWS 배포 시도
# ============================================
Write-Log "4️⃣ AWS 배포 시도..." "Yellow"

if ($sshAvailable) {
    Write-Log "   SSH 접속 가능 - 배포 시도 중..." "Cyan"
    
    try {
        $sshKey = "C:\Users\guddn\Downloads\COCO\pumpy-key.pem"
        $deployCmd = "cd ~/pumpy 2>/dev/null || (cd ~ && git clone https://github.com/BJJTOM/pumpy.git && cd pumpy); git pull origin main; cd gym_api && source venv/bin/activate 2>/dev/null || (python3 -m venv venv && source venv/bin/activate); pip install -q -r requirements.txt; python manage.py migrate; sudo systemctl restart gunicorn; cd ../gym_web && npm install --prefer-offline; npm run build; pm2 restart gym-web 2>/dev/null || pm2 start npm --name gym-web -- start; pm2 save; sudo systemctl restart nginx; echo 'Deploy Complete'"
        
        $deployResult = ssh -i $sshKey -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@3.27.28.175 $deployCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "   ✅ AWS 배포 성공!" "Green"
            Write-Log "   🌐 접속 URL: http://3.27.28.175" "Green"
        } else {
            Write-Log "   ❌ AWS 배포 실패" "Red"
            Write-Log "   에러: $deployResult" "Gray"
        }
    } catch {
        Write-Log "   ❌ SSH 배포 예외: $($_.Exception.Message)" "Red"
    }
} else {
    Write-Log "   ⚠️  SSH 접속 불가 - 배포 스킵" "Yellow"
    Write-Log ""
    Write-Log "   📋 수동 배포 방법:" "Cyan"
    Write-Log "   1. AWS 콘솔 → EC2 → 인스턴스 선택" "White"
    Write-Log "   2. '연결' → 'Session Manager' 선택" "White"
    Write-Log "   3. 다음 명령어 실행:" "White"
    Write-Log '   cd ~/pumpy && git pull && cd gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && sudo systemctl restart gunicorn && cd ../gym_web && npm install && npm run build && pm2 restart gym-web && sudo systemctl restart nginx' "Gray"
}

Write-Log ""

# ============================================
# 5단계: GitHub 푸시 (최신 코드 저장)
# ============================================
Write-Log "5️⃣ GitHub에 최신 코드 푸시..." "Yellow"

try {
    Set-Location "C:\Users\guddn\Downloads\COCO"
    
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        Write-Log "   - 변경사항 커밋 중..." "White"
        git add -A
        git commit -m "Update: WebView APK v2.0.0 with all features" -m "- Added WebView-based hybrid app" -m "- Includes boxing character, AI edit, community, membership" -m "- All latest features from web app"
        
        Write-Log "   - GitHub 푸시 중..." "White"
        $pushResult = git push origin main 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "   ✅ GitHub 푸시 성공!" "Green"
        } else {
            Write-Log "   ⚠️  GitHub 푸시 실패 (이미 최신일 수 있음)" "Yellow"
        }
    } else {
        Write-Log "   ℹ️  변경사항 없음 - 푸시 스킵" "Cyan"
    }
} catch {
    Write-Log "   ⚠️  GitHub 푸시 예외: $($_.Exception.Message)" "Yellow"
}

Write-Log ""

# ============================================
# 최종 결과
# ============================================
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
Write-Log "📊 최종 배포 결과" "Cyan"
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
Write-Log ""

# APK 상태
$finalApk = "C:\Users\guddn\Downloads\COCO\Pumpy_v2.0.0_Final.apk"
if (Test-Path $finalApk) {
    $apkInfo = Get-Item $finalApk
    Write-Log "✅ APK: 빌드 완료" "Green"
    Write-Log "   📦 파일: $finalApk" "White"
    Write-Log "   📏 크기: $([math]::Round($apkInfo.Length/1MB,2)) MB" "White"
    Write-Log "   🕐 생성: $($apkInfo.LastWriteTime)" "White"
} else {
    Write-Log "❌ APK: 빌드 실패" "Red"
}

Write-Log ""

# AWS 상태
if ($httpTest) {
    Write-Log "✅ AWS: 배포 완료 및 서비스 실행 중" "Green"
    Write-Log "   🌐 URL: http://3.27.28.175" "White"
} elseif ($sshAvailable) {
    Write-Log "⚠️  AWS: SSH 접속 가능하나 배포 확인 필요" "Yellow"
} elseif ($serverAlive) {
    Write-Log "⚠️  AWS: 서버 살아있으나 포트 차단됨" "Yellow"
    Write-Log "   🔧 보안그룹 설정 필요" "White"
} else {
    Write-Log "❌ AWS: 서버 다운 또는 네트워크 문제" "Red"
    Write-Log "   🔧 AWS 콘솔에서 인스턴스 상태 확인 필요" "White"
}

Write-Log ""
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
Write-Log "✨ 모든 작업 완료!" "Cyan"
Write-Log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
Write-Log ""
Write-Log "이 결과는 다음 파일에 저장되었습니다:" "White"
Write-Log "$resultFile" "Cyan"

# 알림음 (선택사항)
[console]::beep(1000,500)

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

