import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // Spring Boot 백엔드 포트
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // /api 없애고 /user/search 처럼 맞추기
      },
      '/directories': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  },
  define: {
    global: 'window',
  },
  resolve: {
    alias : {
      "@": path.resolve(__dirname, "src")
    }
  },

  plugins: [react()],
});
