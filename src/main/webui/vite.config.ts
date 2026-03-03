import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../resources/META-INF/resources',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/disruption': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/supervisor': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

// Made with Bob
