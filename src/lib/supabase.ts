import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

const hasUnsafeSecretKey = supabaseAnonKey?.startsWith('sb_secret_') ?? false

if (hasUnsafeSecretKey) {
  console.warn(
    'ToolTrack ignored a Supabase secret key in VITE_SUPABASE_ANON_KEY. Use the anon public key in browser apps.',
  )
}

export const supabase =
  supabaseUrl && supabaseAnonKey && !hasUnsafeSecretKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = Boolean(supabase)
