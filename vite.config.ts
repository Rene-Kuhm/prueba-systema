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
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          // Chunks dinámicos basados en patrones
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react'
            }
            if (id.includes('firebase')) {
              // Separar Firebase en módulos más pequeños
              if (id.includes('firestore')) {
                return 'firebase-firestore'
              }
              if (id.includes('auth')) {
                return 'firebase-auth'
              }
              if (id.includes('storage')) {
                return 'firebase-storage'
              }
              return 'firebase-core'
            }
            if (id.includes('xlsx')) {
              return 'vendor-xlsx'
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix'
            }
            if (id.includes('tailwind-merge')) {
              return 'vendor-tailwind'
            }
            // Otros vendors comunes
            return 'vendor-deps'
          }
          // Separar páginas y componentes grandes
          if (id.includes('/src/pages/')) {
            return 'pages'
          }
          if (id.includes('/src/components/Admin/')) {
            return 'admin-components'
          }
          if (id.includes('/src/components/')) {
            return 'components'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth',
      'firebase/storage'
    ]
  }
})