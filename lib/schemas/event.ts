import { z } from 'zod'
import type { Database } from '@/database.types'

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  location: z.object({
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    }).default({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    }),
    specific_location: z.string().optional(),
  }).default({
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    specific_location: '',
  }),
  organization_id: z.string().nullable(),
  start_date: z.date(),
  end_date: z.date().nullable(),
  start_time: z.string(),
  end_time: z.string(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly'] as const),
  recurring_days: z.array(z.number()).nullable(),
  recurring_until: z.date().nullable(),
  timezone: z.string(),
  participant_type: z.enum(['all', 'groups', 'individuals'] as const),
  participant_groups: z.array(z.string()).nullable(),
  participant_users: z.array(z.string()).nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled'] as const),
  max_participants: z.number().nullable().optional(),
}) 