type SupabaseEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_ANON_KEY?: string
}

type SupabaseConfig =
  | {
      anonKey: string
      hasUnsafeKey: false
      isConfigured: true
      url: string
    }
  | {
      anonKey?: string
      hasUnsafeKey: boolean
      isConfigured: false
      url?: string
    }

export function isUnsafeSupabaseBrowserKey(key?: string) {
  if (!key) return false
  return key.startsWith('sb_secret_') || key.toLowerCase().includes('service_role')
}

export function getSupabaseConfig(env: SupabaseEnv): SupabaseConfig {
  const url = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  const hasUnsafeKey = isUnsafeSupabaseBrowserKey(anonKey)

  if (url && anonKey && !hasUnsafeKey) {
    return {
      anonKey,
      hasUnsafeKey: false,
      isConfigured: true,
      url,
    }
  }

  return {
    anonKey,
    hasUnsafeKey,
    isConfigured: false,
    url,
  }
}
