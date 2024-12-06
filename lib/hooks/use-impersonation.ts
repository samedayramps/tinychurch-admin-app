'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ImpersonationState } from '@/lib/types/impersonation'
import { createClient } from '@/lib/utils/supabase/client'

export function useImpersonationStatus(): ImpersonationState {
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/impersonation-status', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      setState(current => ({
        ...current,
        ...data,
        isInitialized: true
      }))
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
    }
  }, [])

  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
    impersonatingId: null,
    realUserId: null,
    isInitialized: false,
    refresh: checkStatus
  })

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return state
} 