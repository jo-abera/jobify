/**
 * Vite dev/build configuration for the React SPA.
 * Dev server proxies nothing — API base URL is set in src/api/axios.js (VITE_API_URL).
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
})
