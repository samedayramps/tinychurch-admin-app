'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WizardProvider } from './wizard-context'
import { WizardProgress } from './wizard-progress'
import { WizardNavigation } from './wizard-navigation'
import { eventSchema, type EventFormData } from './types'
import { STEPS } from './wizard-steps'
import { Form } from '@/components/ui/form'

interface CreateEventWizardProps {
  organizations: { id: string; name: string }[]
  onSuccess?: () => void
}

export function CreateEventWizard({ organizations, onSuccess }: CreateEventWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      organization_id: '',
      use_different_address: false,
      location: {
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'US',
        },
        specific_location: '',
      },
      start_date: new Date(),
      end_date: null,
      start_time: '09:00',
      end_time: '17:00',
      frequency: 'once',
      recurring_days: [],
      recurring_until: null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      participant_type: 'all',
      participant_groups: [],
      participant_users: [],
      status: 'scheduled',
      is_public: false,
      show_on_website: false,
      requires_registration: false,
      max_participants: null,
      recurring_indefinitely: false
    }
  })

  const CurrentStepComponent = STEPS[currentStep].component

  return (
    <WizardProvider 
      form={form}
      currentStep={currentStep}
      totalSteps={STEPS.length}
      onStepChange={setCurrentStep}
    >
      <Form {...form}>
        <div className="space-y-6">
          <WizardProgress />
          
          <div className="min-h-[400px]">
            <CurrentStepComponent organizations={organizations} />
          </div>

          <WizardNavigation onSuccess={onSuccess} />
        </div>
      </Form>
    </WizardProvider>
  )
} 