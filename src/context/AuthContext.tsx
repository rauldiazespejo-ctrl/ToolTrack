import { createContext, useEffect, useMemo, type ReactNode } from 'react'
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/clerk-react'
import { setAuthTokenProvider } from '../services'

/**
 * Compat shape: mimics enough of the previous Supabase User to keep
 * existing consumers (Header, Sidebar, ProtectedRoute) working unchanged.
 */
export interface AuthUser {
  id: string
  email: string
  user_metadata: { full_name?: string }
}

export interface AuthState {
  user: AuthUser | null
  session: null
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth()
  const { user: clerkUser } = useUser()
  const clerk = useClerk()

  // Wire the token provider for apiAdapter as soon as we know signed-in state.
  useEffect(() => {
    setAuthTokenProvider(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken, isSignedIn])

  const value = useMemo<AuthContextValue>(() => {
    const user: AuthUser | null = clerkUser
      ? {
          id: clerkUser.id,
          email:
            clerkUser.primaryEmailAddress?.emailAddress ??
            clerkUser.emailAddresses[0]?.emailAddress ??
            '',
          user_metadata: {
            full_name:
              clerkUser.fullName ??
              [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' '),
          },
        }
      : null

    return {
      user,
      session: null,
      isLoading: !isLoaded,
      isAuthenticated: !!isSignedIn,
      isMockMode: false,
      signIn: async (email: string, password: string) => {
        try {
          const res = await clerk.client.signIn.create({ identifier: email, password })
          if (res.status === 'complete') {
            await clerk.setActive({ session: res.createdSessionId })
            return { error: null }
          }
          return { error: new Error('signIn status: ' + res.status) }
        } catch (e) {
          const errObj = e as { errors?: { message: string }[]; message?: string }
          const msg = errObj.errors?.[0]?.message ?? errObj.message ?? 'Error de autenticacion'
          return { error: new Error(msg) }
        }
      },
      signOut: async () => {
        await clerkSignOut()
      },
    }
  }, [clerkUser, isLoaded, isSignedIn, clerk, clerkSignOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
