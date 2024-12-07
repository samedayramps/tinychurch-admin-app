import type { Database } from '@/database.types'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

export type AvailableFeature = 'events' | 'groups' | 'donations' | 'messaging' | 'attendance'

export const AVAILABLE_FEATURES: readonly AvailableFeature[] = [
  'events',
  'groups',
  'donations',
  'messaging',
  'attendance',
] as const

export interface OrganizationWithMembers extends Organization {
  members?: OrganizationMember[]
} 