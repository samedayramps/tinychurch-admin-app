'use client'

import { useEffect } from 'react'
import { Alert } from '@/components/ui/alert'

export function ImpersonationErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Impersonation error:', error)
  }, [error])

  return (
    <Alert variant="destructive">
      <h2>Something went wrong with impersonation</h2>
      <button onClick={reset}>Try again</button>
    </Alert>
  )
} 