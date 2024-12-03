'use client'

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { IMPERSONATION_EVENT } from '@/lib/events/impersonation'

// Add proper type for the event
interface ImpersonationEventDetail {
  type: 'start' | 'stop'
  userId?: string
}

interface ImpersonationState {
  isImpersonating: boolean
  impersonatedUserId: string | null
  isInitialized: boolean
  refresh: () => Promise<void>
}

const ImpersonationContext = createContext<ImpersonationState | null>(null)

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = useRef(createClient())
  const lastCheck = useRef<number>(0)
  const MIN_CHECK_INTERVAL = 2000

  const checkImpersonationStatus = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && now - lastCheck.current < MIN_CHECK_INTERVAL) {
      return
    }

    try {
      lastCheck.current = now
      const response = await fetch('/api/auth/impersonation-status', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      setIsImpersonating(data.isImpersonating)
      setImpersonatedUserId(data.impersonatingId)
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
      setIsImpersonating(false)
      setImpersonatedUserId(null)
    }
  }, [])

  // Initial check
  useEffect(() => {
    checkImpersonationStatus(true)
  }, [checkImpersonationStatus])

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.current.auth.onAuthStateChange(async (event) => {
      console.log('🔑 Auth state changed:', event)
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
        await checkImpersonationStatus(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkImpersonationStatus])

  // Listen for impersonation events
  useEffect(() => {
    function handleImpersonationEvent(e: Event) {
      const event = e as CustomEvent<ImpersonationEventDetail>
      console.log('🎭 Impersonation event received:', event.detail)
      
      // Force immediate status check
      checkImpersonationStatus(true)
      
      // If stopping, immediately clear state
      if (event.detail.type === 'stop') {
        setIsImpersonating(false)
        setImpersonatedUserId(null)
      }
    }

    // Add event listener with proper typing
    window.addEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)

    return () => {
      window.removeEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
    }
  }, [checkImpersonationStatus])

  // Gentle polling for backup
  useEffect(() => {
    if (!isInitialized) return

    const interval = setInterval(() => {
      checkImpersonationStatus()
    }, 10000)

    return () => clearInterval(interval)
  }, [checkImpersonationStatus, isInitialized])

  return (
    <ImpersonationContext.Provider value={{
      isImpersonating,
      impersonatedUserId,
      isInitialized,
      refresh: () => checkImpersonationStatus(true)
    }}>
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonationStatus() {
  const context = useContext(ImpersonationContext)
  if (!context) {
    throw new Error('useImpersonationStatus must be used within an ImpersonationProvider')
  }
  return context
} 