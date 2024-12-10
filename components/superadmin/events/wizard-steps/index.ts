import { EventDetailsStep } from './event-details-step'
import { SchedulingStep } from './scheduling-step'
import { ParticipantsStep } from './participants-step'
import { SettingsStep } from './settings-step'
import { ReviewStep } from './review-step'
import { 
  eventDetailsSchema, 
  schedulingSchema, 
  participantsSchema, 
  settingsSchema 
} from '../types'
import type { EventFormData } from '../types'
import * as z from 'zod'

// Base props that all steps will receive
interface BaseStepProps {
  organizations: { id: string; name: string }[]
}

interface WizardStepDefinition {
  title: string
  description: string
  component: React.ComponentType<BaseStepProps>
  validationSchema?: z.ZodSchema
  fields: Array<keyof EventFormData>
}

export const STEPS: readonly WizardStepDefinition[] = [
  {
    title: 'Event Details',
    description: 'Basic information about the event',
    component: EventDetailsStep,
    validationSchema: eventDetailsSchema,
    fields: ['title', 'description', 'organization_id', 'location']
  },
  {
    title: 'Scheduling',
    description: 'When the event will occur',
    component: SchedulingStep,
    validationSchema: schedulingSchema,
    fields: ['start_date', 'end_date', 'start_time', 'end_time', 'frequency', 'recurring_days', 'recurring_until', 'timezone']
  },
  {
    title: 'Participants',
    description: 'Who can attend',
    component: ParticipantsStep,
    validationSchema: participantsSchema,
    fields: ['participant_type', 'participant_groups', 'participant_users']
  },
  {
    title: 'Settings',
    description: 'Additional configurations',
    component: SettingsStep,
    validationSchema: settingsSchema,
    fields: ['status', 'is_public', 'show_on_website', 'requires_registration', 'max_participants']
  },
  {
    title: 'Review',
    description: 'Review and create',
    component: ReviewStep,
    fields: []
  }
] as const

export type WizardStep = typeof STEPS[number] 