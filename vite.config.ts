import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    server: {
      host: '0.0.0.0', // 외부 접속 가능하게!
      port: 5173,
      allowedHosts: ['.ngrok-free.app'], // ✅ ngrok 도메인 허용
      proxy: {
        '/api': {
          target: env.VITE_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/todo': {
          target: env.VITE_BASE_URL,
          changeOrigin: true,
        },
        '/directories': {
          target: env.VITE_BASE_URL,
          changeOrigin: true,
        },
      },
    },
    define: {
      global: 'window',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [react()],
  }
})
