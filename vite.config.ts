import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': [
            '@firebase/app',
            '@firebase/auth',
            '@firebase/firestore',
            '@firebase/storage',
            '@firebase/messaging'
          ],
          'vendor-ui': ['react-toastify'],
          'routes-admin': ['/src/routes/AdminRoutes'],
          'routes-technician': ['/src/routes/TechnicianRoutes'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});