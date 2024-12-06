import type { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'

// Repository type definitions
export type OrganizationRepository = BaseRepository<'organizations'>
export type OrganizationMemberRepository = BaseRepository<'organization_members'>
export type UserRepository = BaseRepository<'profiles'>
export type AuditLogRepository = BaseRepository<'user_activity_logs'>
export type ProfileRepository = BaseRepository<'profiles'>
export type SettingsRepository = BaseRepository<'organization_settings'> 