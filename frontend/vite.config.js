import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_DEV_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_DEV_URL || 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
