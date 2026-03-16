import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.dev', 'uncorrelated-guardianless-nickole.ngrok-free.dev', true],
  },
})
