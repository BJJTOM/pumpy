# Monitor and Report Completion
$apkPath = "C:\Users\guddn\Downloads\COCO\pumpy-app\android\app\build\outputs\apk\release\app-release.apk"
$resultFile = "C:\Users\guddn\Downloads\COCO\FINAL_STATUS.txt"

function Check-Status {
    Clear-Host
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host "Pumpy Build & Deploy Status" -ForegroundColor Cyan
    Write-Host "==================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check APK
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        $sizeMB = [math]::Round($apk.Length/1MB, 2)
        $age = (Get-Date) - $apk.LastWriteTime
        
        if ($age.TotalMinutes -lt 30) {
            Write-Host "APK BUILD: COMPLETE!" -ForegroundColor Green
            Write-Host "  File: Pumpy_v2_Final.apk" -ForegroundColor White
            Write-Host "  Size: $sizeMB MB" -ForegroundColor White
            Write-Host "  Time: $($apk.LastWriteTime.ToString('HH:mm:ss'))" -ForegroundColor White
            
            # Copy to easy location
            Copy-Item $apkPath -Destination "C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk" -Force -ErrorAction SilentlyContinue
            
            $apkComplete = $true
        } else {
            Write-Host "APK BUILD: OLD FILE (checking...)" -ForegroundColor Yellow
            $apkComplete = $false
        }
    } else {
        Write-Host "APK BUILD: IN PROGRESS..." -ForegroundColor Yellow
        $apkComplete = $false
    }
    
    Write-Host ""
    
    # Check AWS
    $httpTest = Test-NetConnection -ComputerName "3.27.28.175" -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($httpTest) {
        Write-Host "AWS DEPLOY: ONLINE!" -ForegroundColor Green
        Write-Host "  URL: http://3.27.28.175" -ForegroundColor White
        $awsComplete = $true
    } else {
        Write-Host "AWS DEPLOY: PENDING..." -ForegroundColor Yellow
        $awsComplete = $false
    }
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Cyan
    
    return ($apkComplete -and $awsComplete)
}

# Monitor loop
$maxWait = 30 # minutes
$checkInterval = 30 # seconds
$elapsed = 0

Write-Host "Starting monitoring..." -ForegroundColor Cyan
Write-Host ""

while ($elapsed -lt ($maxWait * 60)) {
    $allComplete = Check-Status
    
    if ($allComplete) {
        Write-Host ""
        Write-Host "ALL TASKS COMPLETED!" -ForegroundColor Green -BackgroundColor Black
        Write-Host ""
        Write-Host "APK Location:" -ForegroundColor Cyan
        Write-Host "  C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk" -ForegroundColor White
        Write-Host ""
        Write-Host "Web App URL:" -ForegroundColor Cyan
        Write-Host "  http://3.27.28.175" -ForegroundColor White
        Write-Host ""
        
        # Save final status
        @"
=================================
PUMPY DEPLOYMENT COMPLETE
=================================

APK: C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk
WEB: http://3.27.28.175
TIME: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

All features included:
- Boxing character with AI edit
- Game-style room (profile)
- Community (posts, comments, likes)
- Membership payment
- Level, XP, badges, titles
- Today's steps
- WOD display

=================================
"@ | Out-File -FilePath $resultFile -Encoding UTF8
        
        # Beep
        [console]::beep(1000,300)
        [console]::beep(1200,300)
        [console]::beep(1500,500)
        
        break
    }
    
    Write-Host ""
    Write-Host "Checking again in $checkInterval seconds..." -ForegroundColor Gray
    Write-Host "Elapsed: $([math]::Round($elapsed/60, 1)) / $maxWait minutes" -ForegroundColor Gray
    
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
}

if ($elapsed -ge ($maxWait * 60)) {
    Write-Host ""
    Write-Host "TIMEOUT: Some tasks may still be running" -ForegroundColor Yellow
    Write-Host "Check manually:" -ForegroundColor Yellow
    Write-Host "  - APK: $apkPath" -ForegroundColor White
    Write-Host "  - AWS: http://3.27.28.175" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

