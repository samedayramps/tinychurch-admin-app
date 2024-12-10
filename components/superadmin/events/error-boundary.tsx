'use client'

import { useEffect } from 'react'
import { Alert } from '@/components/ui/alert'

export function EventsErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Events error:', error)
  }, [error])

  return (
    <Alert variant="destructive">
      <h2>Something went wrong creating the event</h2>
      <button onClick={reset}>Try again</button>
    </Alert>
  )
} 