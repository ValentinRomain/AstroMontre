@echo off
echo ===================================================
echo       CREATION DE L'APK ASTROCLOCK
echo ===================================================
echo.
echo Ce script va automatiser la creation de l'APK AstroClock.
echo Assurez-vous d'avoir installe:
echo  - Node.js
echo  - Android Studio
echo  - JDK 11 ou superieur
echo.
echo Le chemin vers Android Studio et le JDK doit etre dans votre PATH.
echo.
pause

echo.
echo [1/7] Installation des dependances...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'installation des dependances.
    pause
    exit /b 1
)

echo.
echo [2/7] Installation des dependances Capacitor...
call npm install @capacitor/core @capacitor/android @capacitor/cli
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'installation des dependances Capacitor.
    pause
    exit /b 1
)

echo.
echo [3/7] Construction de l'application web...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de la construction de l'application web.
    pause
    exit /b 1
)

echo.
echo [4/7] Initialisation de Capacitor...
call npx cap init AstroClock com.astroclock.app --web-dir=dist
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'initialisation de Capacitor.
    pause
    exit /b 1
)

echo.
echo [5/7] Ajout de la plateforme Android...
call npx cap add android
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de l'ajout de la plateforme Android.
    pause
    exit /b 1
)

echo.
echo [6/7] Synchronisation des fichiers web vers Android...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Erreur lors de la synchronisation des fichiers.
    pause
    exit /b 1
)

echo.
echo [7/7] Generation de l'APK...
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
