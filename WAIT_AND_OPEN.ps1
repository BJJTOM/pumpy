# Wait for completion and open web page
$apkPath = "C:\Users\guddn\Downloads\COCO\pumpy-app\android\app\build\outputs\apk\release\app-release.apk"
$webUrl = "http://3.27.28.175"

Write-Host "Waiting for APK build to complete..." -ForegroundColor Cyan
Write-Host ""

# Wait for APK file
$maxWait = 20 # minutes
$elapsed = 0
$checkInterval = 10 # seconds

while ($elapsed -lt ($maxWait * 60)) {
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        $age = (Get-Date) - $apk.LastWriteTime
        
        if ($age.TotalMinutes -lt 5) {
            Write-Host "APK BUILD COMPLETE!" -ForegroundColor Green
            Write-Host ""
            
            $sizeMB = [math]::Round($apk.Length/1MB, 2)
            Write-Host "File: $apkPath" -ForegroundColor White
            Write-Host "Size: $sizeMB MB" -ForegroundColor White
            Write-Host "Time: $($apk.LastWriteTime.ToString('HH:mm:ss'))" -ForegroundColor White
            Write-Host ""
            
            # Copy to easy location
            $destPath = "C:\Users\guddn\Downloads\COCO\Pumpy_v2_Final.apk"
            Copy-Item $apkPath -Destination $destPath -Force
            Write-Host "Copied to: $destPath" -ForegroundColor Green
            Write-Host ""
            
            # Beep
            [console]::beep(1000,300)
            [console]::beep(1200,300)
            [console]::beep(1500,500)
            
            # Open web page
            Write-Host "Opening web page..." -ForegroundColor Cyan
            Start-Sleep -Seconds 2
            Start-Process $webUrl
            
            Write-Host ""
            Write-Host "WEB PAGE OPENED: $webUrl" -ForegroundColor Green
            Write-Host ""
            Write-Host "All done! Press any key to exit..." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            
            exit 0
        }
    }
    
    Write-Host "." -NoNewline -ForegroundColor Gray
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    if ($elapsed % 60 -eq 0) {
        Write-Host " $([math]::Round($elapsed/60)) min" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "TIMEOUT: Build taking longer than expected" -ForegroundColor Yellow
Write-Host "Check manually: $apkPath" -ForegroundColor White
Write-Host ""
Write-Host "Opening web page anyway..." -ForegroundColor Cyan
Start-Process $webUrl
Write-Host "Done!" -ForegroundColor Green

