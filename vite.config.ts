import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Tu Aplicación',
        short_name: 'App',
        description: 'Descripción de tu aplicación',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
    cors: true,
    headers: {
      'Service-Worker-Allowed': '/'
    },
    port: 3000,
    proxy: {
      '/sendClaimNotification': {
        target: 'https://us-central1-cospecreclamos.cloudfunctions.net',
        changeOrigin: true,
        secure: false
      },
      '/ultramsg-api': {
        target: 'https://api.ultramsg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ultramsg-api/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': [
            '@firebase/app',
            '@firebase/auth',
            '@firebase/firestore',
            '@firebase/messaging',
            '@firebase/storage'
          ],
          'ui-vendor': [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-switch',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-avatar',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-menu'
          ],
          'utils': ['xlsx', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});