// lib/dal/types.ts
import type { Database } from '@/database.types'

export type DBTables = Database['public']['Tables']

// Extract row types from database types
export type Organization = DBTables['organizations']['Row']
export type Profile = DBTables['profiles']['Row']
export type OrganizationMember = DBTables['organization_members']['Row']
export type AuditLog = DBTables['audit_logs']['Row']

// Extended types with relationships
export interface OrganizationWithMembers extends Organization {
  members: OrganizationMember[]
}

export interface ProfileWithOrganizations extends Profile {
  organizations: Organization[]
  memberships: OrganizationMember[]
}

export interface OrganizationMemberWithProfile extends OrganizationMember {
  profile: Profile
  organization: Organization
}