import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { publicDataPlugin } from './server/vite-public-data'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), publicDataPlugin()],
})
