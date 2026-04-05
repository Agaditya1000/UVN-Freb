import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Prevent Vite from watching outside the project directory
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
  // Ensure the root is explicitly this project's directory
  root: path.resolve(__dirname, '.'),
})
