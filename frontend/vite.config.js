import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ✅ allow external access
    allowedHosts: ['.trycloudflare.com'], // ✅ allow Cloudflare tunnel

    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/anaconda3/**',
        '**/.vscode/**',
        '**/AppData/**',
        '**/Downloads/**',
        '**/Documents/**',
        '**/Pictures/**',
        '**/Videos/**',
        '**/Music/**',
        '**/.conda/**',
        '**/.cargo/**',
        '**/.rustup/**',
        '**/site-packages/**',
      ],
    },
  },

  root: path.resolve(__dirname, '.'),
})