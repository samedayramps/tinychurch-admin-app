'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from './types'
import type { WizardStep } from './wizard-steps'
import { STEPS } from './wizard-steps'

interface WizardContextType {
  form: UseFormReturn<EventFormData>
  currentStep: number
  totalSteps: number
  STEPS: readonly WizardStep[]
  nextStep: () => Promise<void>
  previousStep: () => void
  isLastStep: boolean
  isFirstStep: boolean
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const WizardContext = createContext<WizardContextType | null>(null)

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}

interface WizardProviderProps {
  children: ReactNode
  form: UseFormReturn<EventFormData>
  currentStep: number
  totalSteps: number
  onStepChange: (step: number) => void
}

export function WizardProvider({ 
  children, 
  form, 
  currentStep,
  totalSteps,
  onStepChange 
}: WizardProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextStep = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const currentStepFields = STEPS[currentStep].fields as Array<keyof EventFormData>
      const isValid = await form.trigger(currentStepFields)
      
      if (isValid && currentStep < totalSteps - 1) {
        onStepChange(currentStep + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setError(null)
      onStepChange(currentStep - 1)
    }
  }

  const clearError = () => setError(null)

  return (
    <WizardContext.Provider value={{
      form,
      currentStep,
      totalSteps,
      STEPS,
      nextStep,
      previousStep,
      isLastStep: currentStep === totalSteps - 1,
      isFirstStep: currentStep === 0,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </WizardContext.Provider>
  )
} 