import type { Database } from '@/database.types'


// Base entity interface
export interface BaseEntity extends Record<string, unknown> {
  id: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

// Entity types
export interface Organization extends Record<string, unknown> {
  id: string
  name: string
  slug: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  settings?: {
    features?: string[]
    [key: string]: any
  }
}

export interface Profile extends Record<string, unknown> {
  id: string
  email: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  full_name?: string
  avatar_url?: string
  is_superadmin?: boolean
  theme?: string
  notification_preferences?: Record<string, boolean>
  last_login?: string
  memberships?: Array<{
    role: string
    organizations: {
      id: string
      name: string
      slug: string
    }
  }>
}

export interface OrganizationMember extends Record<string, unknown> {
  id: string
  organization_id: string
  user_id: string
  role: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

export interface OrganizationSettings extends Record<string, unknown> {
  id: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
  settings: {
    features_enabled?: string[]
    branding?: {
      logo_url?: string
      primary_color?: string
    }
    email_templates?: Record<string, any>
    [key: string]: any
  }
}

export interface EventAttendee {
  user_id: string
  status: 'pending' | 'approved' | 'declined' | 'waitlisted'
  profile: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
}

export interface Event extends BaseEntity {
  organization_id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  location_id?: string
  organizer_id: string
  status: 'draft' | 'published' | 'cancelled'
  visibility_level: 'public' | 'members_only' | 'staff_only' | 'private'
  max_attendees?: number
  settings?: {
    allow_waitlist?: boolean
    require_approval?: boolean
    [key: string]: any
  }
  organizer?: {
    id: string
    email: string
    full_name: string
  }
  location?: {
    id: string
    name: string
    address: string
    [key: string]: any
  }
  attendees?: EventAttendee[]
}

// Import repository types from separate file
export type { 
  OrganizationRepository,
  OrganizationMemberRepository,
  UserRepository,
  ProfileRepository,
  SettingsRepository
} from './repository-types' 