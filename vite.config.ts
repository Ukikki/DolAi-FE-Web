import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

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
  define: {
    global: 'window',
  },
  resolve: {
    alias : {
      "@": path.resolve(__dirname, "src")
    }
  },

  plugins: [react()],
})

