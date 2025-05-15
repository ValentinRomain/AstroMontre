# AstroClock - Application Android

Cette application est une version Android de l'extension AstroClock, permettant de visualiser des charts astrologiques et de suivre les aspects planétaires en temps réel.

## Fonctionnalités

- Affichage du zodiaque complet (360°)
- Zodiaque proportionnel (30° - mode standard)
- Zodiaque proportionnel (13.20° - mode Nakshatras)
- Zodiaque des minutes d'arc (0-60')
- Zodiaque des secondes d'arc (0-60")
- Planning des aspects de la journée
- Gestion des aspects personnalisés
- Sauvegarde des préférences

## Comment générer l'APK en un clic

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Android Studio
- JDK 11 ou supérieur

### Méthode simple (script automatisé)

1. Sous Windows, double-cliquez sur le fichier `build-simple.bat`
2. Sous Linux/Mac, ouvrez un terminal et exécutez :
   ```bash
   chmod +x build-simple.sh
   ./build-simple.sh
   ```

Si vous rencontrez des problèmes avec le script simple, essayez le script complet :

1. Sous Windows, double-cliquez sur le fichier `build-apk.bat`
2. Sous Linux/Mac, ouvrez un terminal et exécutez :
   ```bash
   chmod +x build-apk.sh
   ./build-apk.sh
   ```

3. Suivez les instructions à l'écran
4. Une fois terminé, l'APK sera généré dans :
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Méthode manuelle (étape par étape)

Si vous préférez effectuer les étapes manuellement :

1. Installer les dépendances :
```bash
cd AstroClock-APK
npm install
```

2. Installer les dépendances Capacitor :
```bash
npm install @capacitor/core @capacitor/android @capacitor/cli
```

3. Construire l'application web :
```bash
npm run build
```

4. Initialiser Capacitor :
```bash
npx cap init AstroClock com.astroclock.app --web-dir=dist
```

5. Ajouter la plateforme Android :
```bash
npx cap add android
```

6. Copier les fichiers web vers Android :
```bash
npx cap sync android
```

7. Ouvrir le projet dans Android Studio :
```bash
npx cap open android
```

8. Dans Android Studio :
   - Cliquer sur "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
   - Attendre la fin de la compilation
   - Cliquer sur "locate" dans la notification pour trouver le fichier APK

9. Le fichier APK se trouve généralement dans :
   `android/app/build/outputs/apk/debug/app-debug.apk`

## Installation sur Android

1. Transférer le fichier APK sur votre téléphone Android (via USB, email, etc.)
2. Sur votre téléphone, accéder au fichier APK et l'ouvrir
3. Si demandé, autoriser l'installation d'applications provenant de sources inconnues
4. Suivre les instructions d'installation
5. Une fois installée, l'application AstroClock sera disponible sur votre écran d'accueil

## Remarques

- Cette application nécessite Android 5.0 (Lollipop) ou supérieur
- L'application fonctionne entièrement hors ligne, aucune connexion internet n'est requise
- Les données sont stockées localement sur votre appareil
