import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // React y dependencias principales
          'vendor-react': ['react', 'react-dom'],
          
          // Firebase y sus módulos
          'vendor-firebase-core': ['firebase/app'],
          'vendor-firebase-firestore': ['firebase/firestore'],
          'vendor-firebase-auth': ['firebase/auth'],
          'vendor-firebase-webchannel': ['@firebase/webchannel-wrapper'],
          
          // XLSX
          'vendor-xlsx': ['xlsx'],

          // Utilidades y otras dependencias comunes
          'vendor-utils': [
            'react-router-dom',
            'react-hook-form',
            // Agrega aquí otras dependencias comunes que uses
          ],
        },
        // Optimizar nombres de archivos para mejor caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Optimizaciones adicionales
    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/firestore', 'firebase/auth', 'xlsx']
  }
})