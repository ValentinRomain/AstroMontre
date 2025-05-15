#!/bin/bash

echo "==================================================="
echo "       CREATION DE L'APK ASTROCLOCK"
echo "==================================================="
echo
echo "Ce script va automatiser la creation de l'APK AstroClock."
echo "Assurez-vous d'avoir installe:"
echo " - Node.js"
echo " - Android Studio"
echo " - JDK 11 ou superieur"
echo
echo "Le chemin vers Android Studio et le JDK doit etre dans votre PATH."
echo
read -p "Appuyez sur Entrée pour continuer..."

echo
echo "[1/7] Installation des dependances..."
npm install
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dependances."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[2/7] Installation des dependances Capacitor..."
npm install @capacitor/core @capacitor/android @capacitor/cli
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'installation des dependances Capacitor."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[3/7] Construction de l'application web..."
npm run build
if [ $? -ne 0 ]; then
    echo "Erreur lors de la construction de l'application web."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[4/7] Initialisation de Capacitor..."
npx cap init AstroClock com.astroclock.app --web-dir=dist
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'initialisation de Capacitor."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[5/7] Ajout de la plateforme Android..."
npx cap add android
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'ajout de la plateforme Android."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[6/7] Synchronisation des fichiers web vers Android..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "Erreur lors de la synchronisation des fichiers."
    read -p "Appuyez sur Entrée pour quitter..."
    exit 1
fi

echo
echo "[7/7] Generation de l'APK..."
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
