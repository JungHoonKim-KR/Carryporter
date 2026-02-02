import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:8080', // 백엔드 주소
                target: 'https://i14e101.p.ssafy.io/', // 백엔드 주소

        changeOrigin: true,
        secure: false,
        // 만약 백엔드 컨트롤러가 /lockers 이고, 프론트가 /api/lockers로 요청한다면 아래 주석 해제
        // rewrite: (path) => path.replace(/^\/api/, '') 
      },
    },},
})
