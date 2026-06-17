import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './supabaseConfig'

const config = getSupabaseConfig({
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
})

if (config.hasUnsafeKey) {
  console.warn(
    'ToolTrack ignored a Supabase secret key in VITE_SUPABASE_ANON_KEY. Use the anon public key in browser apps.',
  )
}

export const supabase = config.isConfigured
  ? createClient(config.url, config.anonKey)
  : null

export const isSupabaseConfigured = Boolean(supabase)
