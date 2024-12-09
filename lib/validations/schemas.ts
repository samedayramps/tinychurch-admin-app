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

export const messageValidation = {
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
  recipientType: z.enum(['individual', 'group', 'organization']),
  recipientId: z.string().min(1, "Recipient is required"),
  role: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
  scheduledAt: z.string().optional()
    .refine((date) => {
      if (!date) return true // Allow empty for immediate sending
      const scheduledDate = new Date(date)
      const now = new Date()
      return scheduledDate > now
    }, "Scheduled time must be in the future")
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
  }),

  messageForm: z.object({
    subject: messageValidation.subject,
    body: messageValidation.body,
    recipientType: messageValidation.recipientType,
    recipientId: messageValidation.recipientId,
    role: messageValidation.role,
    organizationId: messageValidation.organizationId,
    scheduledAt: messageValidation.scheduledAt,
  }),

  messageSettings: z.object({
    default_from_name: z.string().min(2, "From name must be at least 2 characters"),
    default_reply_to: z.string().email("Please enter a valid email address"),
    notifications_enabled: z.boolean(),
    default_send_time: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .optional(),
  })
} 