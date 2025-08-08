// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Removed ArcGIS-specific alias and optimizeDeps as we are using the CDN approach.
  resolve: {
    alias: {
      // Keep other aliases if you have them, e.g.:
      // 'src': '/src',
    },
  },
  optimizeDeps: {
    include: [
      // No longer explicitly including ArcGIS modules here as they are loaded via CDN
    ],
  },
});
