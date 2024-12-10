import { z } from 'zod'
import type { Database } from '@/database.types'

// Add proper types for the organization
export interface Organization {
  id: string
  name: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
}

export type EventFormData = {
  title: string
  description: string | null
  organization_id: string
  use_different_address: boolean
  location: {
    address: {
      street: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
    specific_location?: string
  }
  start_date: Date
  end_date: Date | null
  start_time: string
  end_time: string
  frequency: Database['public']['Enums']['event_frequency']
  recurring_days: number[] | null
  recurring_until: Date | null
  timezone: string
  participant_type: Database['public']['Enums']['participant_type']
  participant_groups: string[] | null
  participant_users: string[] | null
  status: Database['public']['Enums']['event_status']
  is_public: boolean
  show_on_website: boolean
  requires_registration: boolean
  max_participants: number | null
  recurring_indefinitely: boolean
}

// Step-specific validation schemas
export const eventDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  organization_id: z.string().min(1, "Organization is required"),
  location: z.object({
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    }),
    specific_location: z.string().optional(),
  }),
})

export const schedulingSchema = z.object({
  start_date: z.date().refine(
    (date) => {
      const now = new Date()
      const maxDate = new Date(now.getTime() + (72 * 60 * 60 * 1000)) // 72 hours from now
      return date <= maxDate
    },
    {
      message: "Events can only be scheduled up to 72 hours in advance due to email provider limitations"
    }
  ),
  end_date: z.date().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),
  recurring_days: z.array(z.number()).nullable(),
  recurring_until: z.date().nullable(),
  timezone: z.string(),
  recurring_indefinitely: z.boolean()
})

// Create a separate refinement schema
const timeValidationSchema = z.object({
  start_time: z.string(),
  end_time: z.string()
}).superRefine((data, ctx) => {
  if (data.start_time && data.end_time && data.end_time <= data.start_time) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["end_time"]
    });
  }
});

export const participantsSchema = z.object({
  participant_type: z.enum(['all', 'groups', 'individuals']),
  participant_groups: z.array(z.string()).nullable(),
  participant_users: z.array(z.string()).nullable(),
})

export const settingsSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  is_public: z.boolean().optional(),
  show_on_website: z.boolean().optional(),
  requires_registration: z.boolean().optional(),
  max_participants: z.number().nullable(),
})

// Combined schema for the entire form
export const eventSchema = eventDetailsSchema
  .merge(schedulingSchema)
  .merge(participantsSchema)
  .merge(settingsSchema)
  .superRefine((data, ctx) => {
    if (data.start_time && data.end_time && data.end_time <= data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["end_time"]
      });
    }
  }); 