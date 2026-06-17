import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SOLDESP ToolTrack',
        short_name: 'ToolTrack',
        theme_color: '#0a0f1a',
        background_color: '#0a0f1a',
        display: 'standalone',
      },
    }),
  ],
})
