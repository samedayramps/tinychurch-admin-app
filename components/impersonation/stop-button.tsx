'use client'

import { stopImpersonation } from '@/lib/actions/impersonation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/hooks/use-toast'
import { emitImpersonationEvent } from '@/lib/events/impersonation'

export function StopImpersonationButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStop = async () => {
    try {
      setIsLoading(true)
      
      // Emit event first for immediate UI feedback
      emitImpersonationEvent({ type: 'stop' })
      
      const result = await stopImpersonation()
      
      if ('error' in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to stop impersonation",
        })
        return
      }
      
      if ('success' in result) {
        toast({
          title: "Impersonation stopped",
          description: "You are no longer impersonating another user",
        })
        
        // Force refresh and redirect
        router.refresh()
        router.push('/superadmin/dashboard')
      }
    } catch (error) {
      // If error, emit start event to revert UI
      emitImpersonationEvent({ type: 'start' })
      
      console.error('Error stopping impersonation:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleStop}
      disabled={isLoading}
      variant="outline"
      className="border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
    >
      {isLoading ? 'Stopping...' : 'Stop'}
    </Button>
  )
} 