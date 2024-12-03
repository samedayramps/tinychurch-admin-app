'use client'

import { useEffect, useState, useCallback } from 'react'

function getCookie(name: string) {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

export function useImpersonationStatus() {
  const [isImpersonating, setIsImpersonating] = useState(false)

  const checkImpersonationStatus = useCallback(() => {
    const impersonatingId = getCookie('impersonating_user_id')
    setIsImpersonating(!!impersonatingId)
  }, [])

  useEffect(() => {
    // Check initial status
    checkImpersonationStatus()

    // Set up interval to check periodically
    const interval = setInterval(checkImpersonationStatus, 5000)

    return () => clearInterval(interval)
  }, [checkImpersonationStatus])

  return { isImpersonating }
} 