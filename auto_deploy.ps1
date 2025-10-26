# Pumpy Auto Deploy Script
$ErrorActionPreference = "Continue"
$resultFile = "C:\Users\guddn\Downloads\COCO\DEPLOY_RESULT.txt"

function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $resultFile -Value $logMessage -Force
}

Clear-Content -Path $resultFile -ErrorAction SilentlyContinue
Write-Log "=== Pumpy Auto Deploy Started ==="
Write-Log ""

# Step 1: Clean Gradle Cache
Write-Log "Step 1: Cleaning Gradle cache..."
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
Write-Log "Gradle cache cleaned"
Write-Log ""

# Step 2: Build APK
Write-Log "Step 2: Building APK (this will take 5-10 minutes)..."
Set-Location "C:\Users\guddn\Downloads\COCO\pumpy-app\android"
$env:NODE_ENV = "production"
$env:ANDROID_HOME = "C:\Users\guddn\AppData\Local\Android\Sdk"

& .\gradlew.bat assembleRelease --no-daemon 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Log "APK Build: SUCCESS"
    $apkPath = ".\app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        $sizeMB = [math]::Round($apk.Length/1MB, 2)
        Write-Log "APK Size: $sizeMB MB"
        Copy-Item $apkPath -Destination "C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk" -Force
        Write-Log "APK Location: C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk"
    }
} else {
    Write-Log "APK Build: FAILED"
}
Write-Log ""

# Step 3: Test AWS Server
Write-Log "Step 3: Testing AWS server..."
$sshTest = Test-NetConnection -ComputerName "3.27.28.175" -Port 22 -InformationLevel Quiet -WarningAction SilentlyContinue
$httpTest = Test-NetConnection -ComputerName "3.27.28.175" -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($sshTest) {
    Write-Log "SSH Port: OPEN"
} else {
    Write-Log "SSH Port: CLOSED"
}

if ($httpTest) {
    Write-Log "HTTP Port: OPEN (Service Running)"
} else {
    Write-Log "HTTP Port: CLOSED"
}
Write-Log ""

# Step 4: Deploy to AWS if SSH available
if ($sshTest) {
    Write-Log "Step 4: Deploying to AWS..."
    $sshKey = "C:\Users\guddn\Downloads\COCO\pumpy-key.pem"
    $deployCmd = "cd ~/pumpy && git pull && cd gym_api && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && sudo systemctl restart gunicorn && cd ../gym_web && npm install && npm run build && pm2 restart gym-web && sudo systemctl restart nginx"
    
    ssh -i $sshKey -o ConnectTimeout=30 -o StrictHostKeyChecking=no ubuntu@3.27.28.175 $deployCmd 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "AWS Deploy: SUCCESS"
        Write-Log "URL: http://3.27.28.175"
    } else {
        Write-Log "AWS Deploy: FAILED"
    }
} else {
    Write-Log "Step 4: AWS Deploy SKIPPED (SSH not available)"
}
Write-Log ""

# Step 5: Push to GitHub
Write-Log "Step 5: Pushing to GitHub..."
Set-Location "C:\Users\guddn\Downloads\COCO"
$gitStatus = git status --porcelain 2>&1
if ($gitStatus) {
    git add -A 2>&1 | Out-Null
    git commit -m "Update: WebView APK v2.0.0" 2>&1 | Out-Null
    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Log "GitHub Push: SUCCESS"
    } else {
        Write-Log "GitHub Push: FAILED or Already Up-to-date"
    }
} else {
    Write-Log "GitHub Push: SKIPPED (No changes)"
}
Write-Log ""

Write-Log "=== All Tasks Completed ==="
Write-Log "Results saved to: $resultFile"

[console]::beep(1000,500)



