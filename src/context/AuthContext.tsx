import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

const DEV_AUTH_KEY = 'tooltrack_dev_auth'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isMockMode: boolean
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

const isSupabaseUnavailable = !import.meta.env.VITE_SUPABASE_URL

function loadMockUser(): User | null {
  const raw = localStorage.getItem(DEV_AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function saveMockUser(user: User | null) {
  if (user) localStorage.setItem(DEV_AUTH_KEY, JSON.stringify(user))
  else localStorage.removeItem(DEV_AUTH_KEY)
}

function createMockUser(email: string): User {
  return {
    id: 'dev-user-id',
    email,
    app_metadata: {},
    user_metadata: { full_name: email.split('@')[0], role: 'administrador' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }
}

function getInitialState(): AuthState {
  if (isSupabaseUnavailable) {
    const mockUser = loadMockUser()
    return {
      user: mockUser,
      session: null,
      isLoading: false,
      isAuthenticated: !!mockUser,
      isMockMode: true,
    }
  }
  return {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    isMockMode: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState)

  useEffect(() => {
    if (isSupabaseUnavailable) return

    let mounted = true

    async function initSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }))
        return
      }
      setState({
        user: data.session?.user ?? null,
        session: data.session ?? null,
        isLoading: false,
        isAuthenticated: !!data.session?.user,
        isMockMode: false,
      })
    }

    void initSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        isLoading: false,
        isAuthenticated: !!session?.user,
        isMockMode: false,
      })
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (state.isMockMode) {
      const mockUser = createMockUser(email)
      saveMockUser(mockUser)
      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
      }))
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ?? null }
  }, [state.isMockMode])

  const signOut = useCallback(async () => {
    if (state.isMockMode) {
      saveMockUser(null)
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
      }))
      return
    }

    await supabase.auth.signOut()
  }, [state.isMockMode])

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
