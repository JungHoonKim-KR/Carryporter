import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // 백엔드 CORS 설정에 맞춰 포트 변경
    proxy: {
      // OCR API 프록시 설정 (CORS 우회)
      '/ocr': {
        target: 'https://i14e101.p.ssafy.io',
        changeOrigin: true,
        secure: true,
      },
      // 일반 API 프록시 설정
      '/api': {
        target: 'https://i14e101.p.ssafy.io',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
