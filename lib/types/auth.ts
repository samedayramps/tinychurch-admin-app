export type UserRole = 'superadmin' | 'admin' | 'staff' | 'ministry_leader' | 'member' | 'visitor'

export interface Profile {
  id: string
  email?: string
  full_name?: string
  first_name?: string
  last_name?: string
  avatar_url?: string | null
  is_superadmin?: boolean
  impersonated?: boolean
  alternative_email?: string | null
  phone?: string | null
  language?: string
  theme?: string
  notification_preferences?: {
    email: boolean
    sms: boolean
    push: boolean
  }
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