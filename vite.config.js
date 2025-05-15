import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: false, // Ne pas vider le répertoire de sortie pour conserver nos fichiers préparés
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      external: [
        './src/js/app.js', // Exclure app.js de la résolution pour éviter l'erreur
        './src/css/styles.css' // Exclure styles.css de la résolution pour éviter l'erreur
      ],
      output: {
        manualChunks: {
          vendor: ['@capacitor/core']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
