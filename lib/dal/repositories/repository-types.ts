import type { BaseRepository } from '../base/repository'
import type { 
  Organization,
  OrganizationMember,
  Profile,
  AuditLog,
  Event,
  OrganizationSettings
} from './types'

// Repository type definitions
export type OrganizationRepository = BaseRepository<Organization>
export type OrganizationMemberRepository = BaseRepository<OrganizationMember>
export type UserRepository = BaseRepository<Profile>
export type AuditLogRepository = BaseRepository<AuditLog>
export type EventRepository = BaseRepository<Event>
export type ProfileRepository = BaseRepository<Profile>
export type SettingsRepository = BaseRepository<OrganizationSettings> 