import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    process.env.HTTPS === 'true' ? basicSsl() : null
  ].filter(Boolean),
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    watch: {
      ignored: ['**/.git/**', '**/backend/**', '**/assets/**']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500
  }
})
