import type { Database } from '@/database.types'

export type DBTables = Database['public']['Tables']

// Base entity type
export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// Entity types
export interface Organization extends BaseEntity {
  name: string
  slug: string
  settings?: OrganizationSettings
}

export interface Profile extends BaseEntity {
  email: string
  full_name?: string
  avatar_url?: string
  is_superadmin?: boolean
  theme?: string
  notification_preferences?: Record<string, boolean>
  last_login?: string
}

export interface OrganizationMember extends BaseEntity {
  organization_id: string
  user_id: string
  role: string
}

export interface AuditLog extends BaseEntity {
  organization_id: string
  user_id: string
  action: string
  category: string
  details?: Record<string, any>
}

export interface OrganizationSettings {
  features_enabled?: string[]
  branding?: {
    logo_url?: string
    primary_color?: string
  }
  email_templates?: Record<string, any>
} 