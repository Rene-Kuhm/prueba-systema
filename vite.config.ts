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
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Telecom Complaints',
        short_name: 'Complaints',
        description: 'Sistema de gestión de reclamos',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': 'react',
      'react-dom': 'react-dom'
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
        manualChunks(id) {
          // Dynamic chunks for node_modules
          if (id.includes('node_modules')) {
            if (id.includes('xlsx')) {
              return 'xlsx-vendor';
            }
            if (id.includes('lodash')) {
              return 'lodash-vendor';
            }
            if (id.includes('@firebase')) {
              if (id.includes('firestore')) {
                return 'firebase-firestore';
              }
              if (id.includes('auth')) {
                return 'firebase-auth';
              }
              if (id.includes('storage')) {
                return 'firebase-storage';
              }
              return 'firebase-core';
            }
            if (id.includes('react')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
        assetFileNames: 'assets/[hash][extname]',
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js'
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'global': 'globalThis'
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});