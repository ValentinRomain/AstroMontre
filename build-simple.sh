#!/bin/bash

echo "==================================================="
echo "       CREATION DE L'APK ASTROCLOCK (SIMPLE)"
echo "==================================================="
echo
echo "Ce script va creer une application Android simple avec Capacitor."
echo
read -p "Appuyez sur Entrée pour continuer..."

echo
echo "[1/5] Preparation du dossier..."
mkdir -p dist/src/js dist/src/css
cp index.html dist/
cp src/js/*.js dist/src/js/
cp src/css/*.css dist/src/css/
echo "Dossier prepare avec succes."

echo
echo "[2/5] Installation des dependances Capacitor..."
npm install @capacitor/core @capacitor/android @capacitor/cli
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dependances Capacitor."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[3/5] Initialisation de Capacitor..."
npx cap init AstroClock com.astroclock.app --web-dir=dist
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'initialisation de Capacitor."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[4/5] Ajout de la plateforme Android..."
npx cap add android
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'ajout de la plateforme Android."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[5/5] Generation de l'APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "Erreur lors de la generation de l'APK."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi
cd ..

echo
echo "==================================================="
echo "       APK GENERE AVEC SUCCES!"
echo "==================================================="
echo
echo "L'APK a ete genere avec succes et se trouve dans:"
echo "$(pwd)/android/app/build/outputs/apk/debug/app-debug.apk"
echo
echo "Vous pouvez transferer ce fichier sur votre telephone Android et l'installer."
echo
read -p "Appuyez sur Entrée pour quitter..."
