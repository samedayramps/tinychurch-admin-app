'use client'

import { Button } from '@/components/ui/button'
import { useWizard } from './wizard-context'
import { createEvent } from '@/lib/actions/events'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { EventFormData } from './types'

interface WizardNavigationProps {
  onSuccess?: () => void
}

export function WizardNavigation({ onSuccess }: WizardNavigationProps) {
  const { 
    form, 
    nextStep, 
    previousStep, 
    isLastStep, 
    isFirstStep,
    isLoading,
    error,
    clearError
  } = useWizard()
  const { toast } = useToast()

  const handleSubmit = async (data: EventFormData) => {
    try {
      await createEvent(data)
      toast({
        title: 'Success',
        description: 'Event created successfully',
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" onClose={clearError}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={previousStep}
          disabled={isFirstStep || isLoading}
        >
          Back
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        ) : (
          <Button 
            type="button"
            onClick={() => nextStep()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Next'
            )}
          </Button>
        )}
      </div>
    </div>
  )
} 