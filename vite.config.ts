import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
  base: '/', // Ensure proper base path for assets
  build: {
    outDir: 'dist', // Explicit output directory
    assetsDir: 'assets', // Specify assets subdirectory
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 2000, // Existing chunk size limit
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'], // Explicitly pre-bundle these dependencies
  },
});