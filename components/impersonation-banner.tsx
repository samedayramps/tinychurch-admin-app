'use client'

import { useImpersonationStatus } from '@/lib/hooks/use-impersonation'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { stopImpersonation } from '@/lib/actions/impersonation'

export function ImpersonationBanner() {
  const { isImpersonating } = useImpersonationStatus()
  
  if (!isImpersonating) return null
  
  return (
    <Alert 
      variant="default" 
      className="fixed top-0 left-0 right-0 z-50 border-yellow-500 bg-yellow-50 text-yellow-900"
    >
      <div className="flex items-center justify-between">
        <p>You are currently impersonating another user</p>
        <form action={stopImpersonation}>
          <Button variant="outline" type="submit">
            Stop Impersonating
          </Button>
        </form>
      </div>
    </Alert>
  )
} 