@echo off
chcp 65001 > nul
title Pumpy 앱 완전 재설치

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   🔥 Pumpy 앱 완전 삭제 후 재설치              ║
echo ║   (모든 문제를 해결하는 완벽한 방법)            ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo ⚠️  이 작업은 5-10분 정도 걸립니다.
echo ⚠️  진행 중에는 창을 닫지 마세요!
echo.
pause

REM ============================================
REM 1단계: 모든 프로세스 중지
REM ============================================
echo.
echo ═══════════════════════════════════════════
echo [1/10] 실행 중인 프로세스 모두 중지...
echo ═══════════════════════════════════════════
taskkill /F /IM node.exe 2>nul
taskkill /F /IM java.exe 2>nul
taskkill /F /IM gradle.exe 2>nul
timeout /t 2 /nobreak > nul
echo ✅ 완료
echo.

REM ============================================
REM 2단계: 에뮬레이터에서 앱 완전 삭제
REM ============================================
echo ═══════════════════════════════════════════
echo [2/10] 에뮬레이터에서 기존 앱 삭제...
echo ═══════════════════════════════════════════
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" uninstall com.pumpyapp 2>nul
if %errorlevel% equ 0 (
    echo ✅ 기존 앱 삭제 완료
) else (
    echo ⚠️  앱이 설치되어 있지 않거나 이미 삭제됨
)
echo.

REM ============================================
REM 3단계: PumpyApp 폴더로 이동
REM ============================================
echo ═══════════════════════════════════════════
echo [3/10] PumpyApp 폴더로 이동...
echo ═══════════════════════════════════════════
cd /d "%~dp0PumpyApp"
if not exist "package.json" (
    echo ❌ PumpyApp 폴더를 찾을 수 없습니다!
    pause
    exit /b 1
)
echo ✅ 완료
echo.

REM ============================================
REM 4단계: 모든 캐시 및 빌드 파일 삭제
REM ============================================
echo ═══════════════════════════════════════════
echo [4/10] 모든 캐시 및 빌드 파일 삭제...
echo ═══════════════════════════════════════════

if exist ".expo" (
    echo 📁 .expo 폴더 삭제 중...
    rmdir /s /q .expo 2>nul
    echo    ✅ .expo 삭제
)

if exist "node_modules" (
    echo 📁 node_modules 폴더 삭제 중... (시간 걸림)
    rmdir /s /q node_modules 2>nul
    echo    ✅ node_modules 삭제
)

if exist "android\.gradle" (
    echo 📁 android\.gradle 폴더 삭제 중...
    rmdir /s /q android\.gradle 2>nul
    echo    ✅ android\.gradle 삭제
)

if exist "android\app\build" (
    echo 📁 android\app\build 폴더 삭제 중...
    rmdir /s /q android\app\build 2>nul
    echo    ✅ android\app\build 삭제
)

if exist "android\build" (
    echo 📁 android\build 폴더 삭제 중...
    rmdir /s /q android\build 2>nul
    echo    ✅ android\build 삭제
)

if exist "%TEMP%\react-native-*" (
    echo 📁 임시 파일 삭제 중...
    del /s /q "%TEMP%\react-native-*" 2>nul
)

if exist "%TEMP%\metro-*" (
    del /s /q "%TEMP%\metro-*" 2>nul
)

echo ✅ 모든 캐시 삭제 완료
echo.

REM ============================================
REM 5단계: npm 캐시 정리
REM ============================================
echo ═══════════════════════════════════════════
echo [5/10] npm 캐시 정리 중...
echo ═══════════════════════════════════════════
call npm cache clean --force
echo ✅ 완료
echo.

REM ============================================
REM 6단계: node_modules 재설치
REM ============================================
echo ═══════════════════════════════════════════
echo [6/10] node_modules 재설치 중...
echo ═══════════════════════════════════════════
echo 📦 패키지 설치 중... (1-3분 소요)
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ npm install 실패!
    echo.
    echo 해결 방법:
    echo 1. 인터넷 연결 확인
    echo 2. 관리자 권한으로 실행
    echo 3. package-lock.json 삭제 후 재시도
    echo.
    pause
    exit /b 1
)
echo ✅ 완료
echo.

REM ============================================
REM 7단계: Android Gradle 캐시 정리
REM ============================================
echo ═══════════════════════════════════════════
echo [7/10] Android Gradle 캐시 정리...
echo ═══════════════════════════════════════════
cd android
call gradlew clean
cd ..
echo ✅ 완료
echo.

REM ============================================
REM 8단계: 앱 빌드 및 설치
REM ============================================
echo ═══════════════════════════════════════════
echo [8/10] 앱 빌드 및 설치 중...
echo ═══════════════════════════════════════════
echo 📱 에뮬레이터에 앱 설치 중... (2-5분 소요)
echo.
call npx react-native run-android
if %errorlevel% neq 0 (
    echo.
    echo ❌ 앱 빌드 실패!
    echo.
    echo 해결 방법:
    echo 1. 에뮬레이터가 실행 중인지 확인
    echo 2. Android Studio를 관리자 권한으로 실행
    echo 3. 에뮬레이터를 재시작
    echo.
    pause
    exit /b 1
)
echo ✅ 앱 설치 완료
echo.

REM ============================================
REM 9단계: 포트 설정
REM ============================================
echo ═══════════════════════════════════════════
echo [9/10] 포트 설정...
echo ═══════════════════════════════════════════
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
echo ✅ 완료
echo.

REM ============================================
REM 10단계: Metro Bundler 시작
REM ============================================
echo ═══════════════════════════════════════════
echo [10/10] Metro Bundler 시작...
echo ═══════════════════════════════════════════
echo 💡 새 터미널 창에서 Metro Bundler가 실행됩니다
echo ⚠️  그 창을 절대 닫지 마세요!
echo.
start "Metro Bundler - 절대 닫지 마세요!" cmd /k "npx react-native start --reset-cache"
timeout /t 5 /nobreak > nul
echo ✅ 완료
echo.

REM ============================================
REM 완료!
REM ============================================
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║          🎉 설치 완료!                          ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo ✅ 모든 작업이 완료되었습니다!
echo.
echo 📱 에뮬레이터를 확인하세요:
echo    - 앱이 자동으로 실행되었을 것입니다
echo    - 로그인 화면 또는 서버 설정 화면이 보여야 합니다
echo.
echo ⚠️  주의사항:
echo    1. Metro Bundler 터미널을 닫지 마세요!
echo    2. 에뮬레이터를 닫지 마세요!
echo.
echo 💡 문제가 있다면:
echo    - 에뮬레이터에서 R 키를 두 번 누르세요
echo    - 또는 Ctrl+M → Reload 선택
echo.
echo ═══════════════════════════════════════════════════
pause

