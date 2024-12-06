import * as z from 'zod'
import type { Database } from '@/database.types'

export const userValidation = {
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(['admin', 'staff', 'ministry_leader', 'member', 'visitor']),
  is_active: z.boolean().default(true),
  is_superadmin: z.boolean().default(false),
  organization_id: z.string().optional().or(z.literal('')),
  alternative_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['invited', 'active', 'suspended', 'inactive', 'deleted'] as const).optional().default('active'),
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(false),
  }).optional(),
}

export const schemas = {
  userForm: z.object({
    first_name: userValidation.first_name,
    last_name: userValidation.last_name,
    email: userValidation.email,
    role: userValidation.role,
    is_active: userValidation.is_active,
    alternative_email: userValidation.alternative_email,
    phone: userValidation.phone,
    is_superadmin: userValidation.is_superadmin,
    status: userValidation.status,
    notification_preferences: userValidation.notification_preferences,
    organization_id: userValidation.organization_id,
  }),
  
  userInviteForm: z.object({
    first_name: userValidation.first_name,
    last_name: userValidation.last_name,
    email: userValidation.email,
    role: userValidation.role,
    is_active: userValidation.is_active,
    is_superadmin: userValidation.is_superadmin,
    organization_id: z.string().min(1, "Organization is required"),
  }),

  profileForm: z.object({
    first_name: userValidation.first_name,
    last_name: userValidation.last_name,
    email: userValidation.email,
    alternative_email: userValidation.alternative_email,
    phone: userValidation.phone,
    notification_preferences: userValidation.notification_preferences,
  })
} 