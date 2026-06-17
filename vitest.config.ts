import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react() as never],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://localhost:54321'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-key'),
  },
})
