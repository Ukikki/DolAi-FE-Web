import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    server: {
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
