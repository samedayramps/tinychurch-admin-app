import type { Database } from '@/database.types'

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
  is_superadmin?: boolean
  alternative_email?: string | null
  phone?: string | null
  language?: string
  theme?: string
  notification_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  organization_members?: Array<{
    organizations: {
      id: string
      name: string
    }
    role: string
  }>
  impersonated?: boolean
}

export interface OrganizationMember {
  id: string
  user_id: string
  role: 'admin' | 'staff' | 'member'
  organizations: {
    id: string
    name: string
    slug: string
  }
}

export interface Organization {
  id: string
  name: string
  slug: string
  settings: Record<string, any>
}

export interface ImpersonationStatus {
  isImpersonating: boolean
  impersonatedUserId: string | null
}

export interface ImpersonationError {
  error: string
} 