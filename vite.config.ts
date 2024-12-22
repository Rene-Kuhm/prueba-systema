import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
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
    assetsDir: 'assets',
    emptyOutDir: true,
  }
});