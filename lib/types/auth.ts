import type { Database } from '@/database.types'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'superadmin' | 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  alternative_email?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  is_superadmin: boolean
  status: Database['public']['Enums']['auth_status']
  notification_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  created_at: string
  updated_at: string
  last_login?: string | null
  invited_at?: string | null
  organization_members?: Array<{
    role: Database['public']['Enums']['user_role']
    organizations: {
      id: string
      name: string
    }
  }>
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
  settings?: Record<string, any>
}

export interface UserActivityLog {
  id: string
  user_id: string
  event_type: Database['public']['Enums']['activity_event_type']
  details: string
  metadata: Record<string, any>
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  organization_id?: string | null
}

export interface AuthStatus {
  user: User | null
} 