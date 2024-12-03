'use client'

import { useImpersonationStatus } from '@/lib/dal/auth'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { stopImpersonation } from '@/lib/actions/impersonation'

export function ImpersonationBanner() {
  const { isImpersonating } = useImpersonationStatus()
  
  if (!isImpersonating) return null
  
  return (
    <Alert variant="warning" className="fixed top-0 left-0 right-0 z-50">
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