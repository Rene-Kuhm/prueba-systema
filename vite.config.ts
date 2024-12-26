import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxImportSource: 'react',
      babel: {
        parserOpts: {
          plugins: ['jsx']
        }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png'
      ],
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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
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
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: mode === 'production' ? 'terser' : false,
    rollupOptions: {
      external: ['sharp'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-core': ['@firebase/app'],
          'firebase-auth': ['@firebase/auth'],
          'firebase-firestore': ['@firebase/firestore'],
          'firebase-storage': ['@firebase/storage'],
          'utils': ['lodash', 'xlsx']
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(mode),
    __VITE_PWA_ENABLED__: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      target: 'es2020'
    },
    exclude: ['sharp']
  },
  esbuild: {
    jsx: 'automatic',
  }
}));