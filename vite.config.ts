import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      '.trycloudflare.com',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      'yolkless-twanna-ultrabasic.ngrok-free.dev',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
