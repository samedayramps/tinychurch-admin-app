'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import { log } from '@/lib/utils/logger'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStatus } from '@/lib/hooks/use-auth-status'

export function AuthDebug() {
  const { user, loading } = useAuth()
  const { data: authStatus, isLoading: authStatusLoading } = useAuthStatus()
  const [debugInfo, setDebugInfo] = useState<{
    email?: string
    role?: string
    isSuperadmin?: boolean
    isLoading: boolean
    userId?: string
  }>({
    isLoading: true
  })

  useEffect(() => {
    if (loading || authStatusLoading) return

    async function loadDebugInfo() {
      const requestId = crypto.randomUUID()
      const supabase = createClient()
      
      log.info('Loading auth debug info', { 
        requestId,
        hasUser: !!user,
      })
      
      try {
        if (!user) {
          log.info('No authenticated user found in debug', { requestId })
          setDebugInfo({
            isLoading: false,
            email: 'Not logged in'
          })
          return
        }

        // Get profile info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_superadmin, email')
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        setDebugInfo({
          email: profile?.email || user.email,
          isSuperadmin: !!profile?.is_superadmin,
          isLoading: false,
          userId: user.id,
        })

      } catch (error) {
        log.error('Failed to load debug info', {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        setDebugInfo({
          email: 'Error loading info',
          isLoading: false
        })
      }
    }

    loadDebugInfo()
  }, [user, loading, authStatusLoading])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (loading || debugInfo.isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
        <div>Loading debug info...</div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm font-mono max-w-xl overflow-auto max-h-[80vh]">
      <div className="space-y-2">
        <div className="font-bold text-yellow-400">Auth Debug Info</div>
        <div>Email: {debugInfo.email}</div>
        <div>User ID: {debugInfo.userId}</div>
        <div>Superadmin: {debugInfo.isSuperadmin ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
} 