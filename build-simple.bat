@echo off
echo ===================================================
echo       CREATION DE L'APK ASTROCLOCK (SIMPLE)
echo ===================================================
echo.
echo Ce script va creer une application Android simple avec Capacitor.
echo.
pause

echo.
echo [1/5] Preparation du dossier...
mkdir dist 2>nul
copy index.html dist\ >nul
mkdir dist\src 2>nul
mkdir dist\src\js 2>nul
mkdir dist\src\css 2>nul
copy src\js\*.js dist\src\js\ >nul
copy src\css\*.css dist\src\css\ >nul
echo Dossier prepare avec succes.

echo.
echo [2/5] Installation des dependances Capacitor...
call npm install @capacitor/core @capacitor/android @capacitor/cli
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'installation des dependances Capacitor.
    pause
    exit /b 1
)

echo.
echo [3/5] Initialisation de Capacitor...
call npx cap init AstroClock com.astroclock.app --web-dir=dist
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'initialisation de Capacitor.
    pause
    exit /b 1
)

echo.
echo [4/5] Ajout de la plateforme Android...
call npx cap add android
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'ajout de la plateforme Android.
    pause
    exit /b 1
)

echo.
echo [5/5] Generation de l'APK...
cd android
call gradlew assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de la generation de l'APK.
    pause
    exit /b 1
)
cd ..

echo.
echo ===================================================
echo       APK GENERE AVEC SUCCES!
echo ===================================================
echo.
echo L'APK a ete genere avec succes et se trouve dans:
echo %CD%\android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Vous pouvez transferer ce fichier sur votre telephone Android et l'installer.
echo.
pause
