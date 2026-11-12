import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
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
