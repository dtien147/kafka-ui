import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // ✅ This makes asset paths relative
  plugins: [
    react(),
  ],
})
