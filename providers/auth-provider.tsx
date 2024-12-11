'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { log } from '@/lib/utils/logger'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  refreshAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshAuth: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const refreshAuth = useCallback(async () => {
    const requestId = crypto.randomUUID()
    try {
      log.debug('Manually refreshing auth state', { requestId })
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      setUser(session?.user ?? null)
      log.info('Auth state manually refreshed', {
        requestId,
        hasUser: !!session?.user
      })
    } catch (error) {
      log.error('Manual auth refresh failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [supabase.auth])

  useEffect(() => {
    const requestId = crypto.randomUUID()

    async function initializeAuth() {
      try {
        log.debug('Initializing auth state', { requestId })
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          log.error('Failed to get initial session', {
            requestId,
            error: error.message
          })
          throw error
        }

        setUser(session?.user ?? null)
        setLoading(false)

        log.info('Auth state initialized', {
          requestId,
          hasUser: !!session?.user,
          pathname
        })

        // If we're on the sign-in page but have a session, redirect
        if (session?.user && pathname === '/sign-in') {
          router.push('/') // This will trigger the root page's redirect logic
        }
      } catch (error) {
        log.error('Auth initialization failed', {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      log.info('Auth state changed', {
        requestId,
        event,
        userId: session?.user?.id,
        pathname
      })

      setUser(session?.user ?? null)
      setLoading(false)
      
      // Force a router refresh and handle redirects
      if (event === 'SIGNED_IN') {
        router.refresh()
        if (pathname === '/sign-in') {
          router.push('/')
        }
      } else if (event === 'SIGNED_OUT') {
        router.refresh()
        router.push('/sign-in')
      }
    })

    return () => {
      log.debug('Cleaning up auth subscriptions', { requestId })
      subscription.unsubscribe()
    }
  }, [supabase, router, pathname])

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
} 