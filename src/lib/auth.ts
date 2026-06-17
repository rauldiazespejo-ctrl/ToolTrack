import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    const client = supabase
    let isMounted = true

    async function loadSession() {
      const { data } = await client.auth.getSession()
      if (isMounted) {
        setUser(data.session?.user ?? null)
        setIsLoading(false)
      }
    }

    void loadSession()

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  return {
    isSupabaseConfigured,
    isLoading,
    user,
    signOut,
  }
}
