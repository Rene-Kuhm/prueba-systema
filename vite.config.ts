import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar las dependencias principales
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix'
            }
            return 'vendor-deps'
          }
          // Separar los componentes por funcionalidad
          if (id.includes('/src/components/')) {
            return 'components'
          }
          if (id.includes('/src/pages/')) {
            return 'pages'
          }
        },
      },
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    },
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  css: {
    modules: {
      generateScopedName: '[local]_[hash:base64:5]'
    },
    postcss: {
      plugins: [require('autoprefixer')]
    }
  }
})