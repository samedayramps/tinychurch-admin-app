'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Only log essential error information to avoid circular references
    const errorInfo = {
      message: error?.message || 'Unknown error',
      name: error?.name || 'Error',
      digest: error?.digest,
      // Only include first few lines of stack trace if available
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    }
    
    console.error('Audit page error:', errorInfo)
  }, [error])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>
          {error?.message || 'There was an error loading the audit logs.'}
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Button onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
} 