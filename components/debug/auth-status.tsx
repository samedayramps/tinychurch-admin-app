'use client'

import { createClient } from '@/lib/utils/supabase/client'
import { useEffect, useState } from 'react'

export function AuthDebug() {
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
    async function loadDebugInfo() {
      const supabase = createClient()
      
      try {
        // Get auth user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setDebugInfo({
            isLoading: false,
            email: 'Not logged in'
          })
          return
        }

        // Get profile info using same logic as getSuperAdminStatus
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_superadmin, email')
          .eq('id', user.id)
          .single()

        // Get organization role if any
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .single()

        setDebugInfo({
          email: profile?.email || user.email,
          role: orgMember?.role || 'No org role',
          isSuperadmin: !!profile?.is_superadmin,
          isLoading: false,
          userId: user.id,
          impersonation: {
            isImpersonating: await checkImpersonationStatus(),
            realUserId: await getRealUserId()
          }
        })
      } catch (error) {
        console.error('Debug info error:', error)
        setDebugInfo({
          email: 'Error loading info',
          isLoading: false
        })
      }
    }

    loadDebugInfo()
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
      {debugInfo.isLoading ? (
        <div>Loading debug info...</div>
      ) : (
        <div className="space-y-1">
          <div>Email: {debugInfo.email}</div>
          <div>Role: {debugInfo.role}</div>
          <div>Superadmin: {debugInfo.isSuperadmin ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  )
}

async function checkImpersonationStatus() {
  try {
    const response = await fetch('/api/auth/impersonation-status')
    const data = await response.json()
    return data.isImpersonating
  } catch (error) {
    console.error('Failed to check impersonation status:', error)
    return false
  }
}

async function getRealUserId() {
  try {
    const response = await fetch('/api/auth/impersonation-status')
    const data = await response.json()
    return data.realUserId
  } catch (error) {
    console.error('Failed to get real user ID:', error)
    return null
  }
} 