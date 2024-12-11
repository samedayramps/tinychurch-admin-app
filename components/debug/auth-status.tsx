'use client'

import { createClient } from '@/lib/utils/supabase/client'
import { useEffect, useState } from 'react'
import { log } from '@/lib/utils/logger'
import { useAuth } from '@/hooks/use-auth'

export function AuthDebug() {
  const { user, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<{
    email?: string
    role?: string
    isSuperadmin?: boolean
    isLoading: boolean
    userId?: string
    impersonation?: {
      isImpersonating: boolean
      realUserId: string | null
    }
  }>({
    isLoading: true
  })

  useEffect(() => {
    // Don't try to load debug info until auth is initialized
    if (loading) {
      return
    }

    async function loadDebugInfo() {
      const requestId = crypto.randomUUID()
      const supabase = createClient()
      
      log.info('Loading auth debug info', { 
        requestId,
        hasUser: !!user
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

        log.debug('Fetching profile info for debug', {
          requestId,
          userId: user.id
        })

        // Get profile info using same logic as getSuperAdminStatus
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_superadmin, email')
          .eq('id', user.id)
          .single()

        if (profileError) {
          log.error('Failed to fetch profile for debug', {
            requestId,
            userId: user.id,
            error: profileError.message
          })
          throw profileError
        }

        // Only fetch organization role if not a superadmin
        let orgRole = 'No org role'
        if (!profile.is_superadmin) {
          log.debug('Fetching organization role for debug', {
            requestId,
            userId: user.id
          })

          const { data: orgMember, error: orgError } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', user.id)
            .single()

          if (orgError && !orgError.message.includes('No rows found')) {
            log.error('Failed to fetch org role for debug', {
              requestId,
              userId: user.id,
              error: orgError.message
            })
          } else if (orgMember) {
            orgRole = orgMember.role
          }
        } else {
          log.debug('Skipping org role fetch for superadmin', {
            requestId,
            userId: user.id
          })
        }

        log.debug('Checking impersonation status for debug', { requestId })
        const [isImpersonating, realUserId] = await Promise.all([
          checkImpersonationStatus(),
          getRealUserId()
        ])

        const debugData = {
          email: profile?.email || user.email,
          role: profile.is_superadmin ? 'superadmin' : orgRole,
          isSuperadmin: !!profile?.is_superadmin,
          isLoading: false,
          userId: user.id,
          impersonation: {
            isImpersonating,
            realUserId
          }
        }

        log.info('Auth debug info loaded', {
          requestId,
          userId: user.id,
          email: debugData.email,
          role: debugData.role,
          isSuperadmin: debugData.isSuperadmin,
          isImpersonating
        })

        setDebugInfo(debugData)
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
  }, [user, loading]) // Add dependencies to re-run when auth state changes

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
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
      <div className="space-y-1">
        <div>Email: {debugInfo.email}</div>
        <div>Role: {debugInfo.role}</div>
        <div>Superadmin: {debugInfo.isSuperadmin ? 'Yes' : 'No'}</div>
        {debugInfo.impersonation?.isImpersonating && (
          <div>
            <div>Impersonating: Yes</div>
            <div>Real User ID: {debugInfo.impersonation.realUserId}</div>
          </div>
        )}
      </div>
    </div>
  )
}

async function checkImpersonationStatus() {
  const requestId = crypto.randomUUID()
  try {
    log.debug('Checking impersonation status', { requestId })
    const response = await fetch('/api/auth/impersonation-status')
    const data = await response.json()
    return data.isImpersonating
  } catch (error) {
    log.error('Failed to check impersonation status', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

async function getRealUserId() {
  const requestId = crypto.randomUUID()
  try {
    log.debug('Getting real user ID', { requestId })
    const response = await fetch('/api/auth/impersonation-status')
    const data = await response.json()
    return data.realUserId
  } catch (error) {
    log.error('Failed to get real user ID', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return null
  }
} 