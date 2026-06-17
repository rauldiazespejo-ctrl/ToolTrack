import { describe, expect, it } from 'vitest'
import { getSupabaseConfig, isUnsafeSupabaseBrowserKey } from './supabaseConfig'

describe('Supabase browser config', () => {
  it('rejects secret keys in browser env', () => {
    expect(isUnsafeSupabaseBrowserKey('sb_secret_example')).toBe(true)
    expect(isUnsafeSupabaseBrowserKey('ey.service_role.example')).toBe(true)
    expect(isUnsafeSupabaseBrowserKey('ey.anon.example')).toBe(false)
  })

  it('requires url and anon key before enabling Supabase', () => {
    expect(getSupabaseConfig({}).isConfigured).toBe(false)
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'sb_secret_example',
      }).isConfigured,
    ).toBe(false)
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: 'https://project.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'ey.anon.example',
      }).isConfigured,
    ).toBe(true)
  })
})
