'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useImpersonationStatus() {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = useRef(createClient())
  const lastCheck = useRef<number>(0)
  const MIN_CHECK_INTERVAL = 5000 // Increase to 5 seconds

  const checkImpersonationStatus = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now - lastCheck.current < MIN_CHECK_INTERVAL) {
      return
    }
    
    try {
      lastCheck.current = now
      const response = await fetch('/api/auth/impersonation-status')
      const data = await response.json()
      
      setIsImpersonating(data.isImpersonating)
      setImpersonatedUserId(data.impersonatingId)
      
      if (!isInitialized) {
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
      setIsImpersonating(false)
      setImpersonatedUserId(null)
    }
  }, [isInitialized])

  // Initial check
  useEffect(() => {
    checkImpersonationStatus(true)
  }, [checkImpersonationStatus])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.current.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        await checkImpersonationStatus(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkImpersonationStatus])

  return {
    isImpersonating,
    impersonatedUserId,
    refresh: () => checkImpersonationStatus(true),
    isInitialized
  }
} 