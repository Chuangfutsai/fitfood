import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules\/(react|react-dom|scheduler)\//, priority: 20 },
            { name: 'motion-vendor', test: /node_modules\/(framer-motion|motion-dom|motion-utils)\//, priority: 10 },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        name: 'FitFood',
        short_name: 'FitFood',
        display: 'standalone',
        background_color: '#F6F8F5',
        theme_color: '#F6F8F5',
        icons: [],
      },
    }),
  ],
});
