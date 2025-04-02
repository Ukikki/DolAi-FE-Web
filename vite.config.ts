import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/directories': {
        target: 'http://localhost:8081', // 백엔드 주소
        changeOrigin: true,
      },
    },
  },
  
  plugins: [react()],
})

