'use client'

import { useEffect, useState } from 'react'
import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import { IMPERSONATION_EVENT, type ImpersonationEventDetail } from '@/lib/events/impersonation'

export function ImpersonationBorder() {
  const { isImpersonating } = useImpersonationStatus()
  const [isVisible, setIsVisible] = useState(isImpersonating)

  useEffect(() => {
    setIsVisible(isImpersonating)
  }, [isImpersonating])

  useEffect(() => {
    function handleImpersonationEvent(e: Event) {
      const event = e as CustomEvent<ImpersonationEventDetail>
      setIsVisible(event.detail.type === 'start')
    }

    window.addEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
    return () => window.removeEventListener(IMPERSONATION_EVENT, handleImpersonationEvent)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none border-4 border-red-600 z-[100]" />
  )
} 