# AstroClock - Fichiers de mise à jour

Ce dossier contient tous les fichiers nécessaires pour mettre à jour votre projet AstroClock sur Codemagic.io.

## Contenu du dossier

1. **codemagic.yaml** - Configuration pour Codemagic.io
2. **vite.config.js** - Configuration pour Vite
3. **index.html** - Page HTML principale
4. **capacitor.config.ts** - Configuration pour Capacitor
5. **src/js/app.js** - Script JavaScript principal
6. **src/css/styles.css** - Feuille de style CSS principale

## Instructions

1. Ajoutez tous ces fichiers à la racine de votre dépôt GitHub
2. Assurez-vous de conserver la structure des dossiers (src/js et src/css)
3. Retournez sur Codemagic.io et cliquez sur "Check for configuration file"
4. Lancez un nouveau build

Ces fichiers sont configurés pour résoudre l'erreur "Could not resolve './src/js/app.js' from 'index.html'" et permettre à Codemagic de générer un APK Android fonctionnel.
