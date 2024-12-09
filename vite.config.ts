import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html') // Ensure the entry point is correct
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Aumenta el límite a 5 MB
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/@).*$/]
      },
      strategies: 'generateSW',
      srcDir: '.',
      filename: 'sw.js',
      injectRegister: 'auto',
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/@).*$/]
      },
      manifest: {
        name: 'Telecom Complaints',
        short_name: 'TeleComplaints',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // Ensure the alias is correctly resolved
    }
  },
  server: {
    open: true
  }
})