import { UserRole } from '@/lib/types/auth'

type RolePermissions = {
  [K in UserRole]: readonly string[]
}

const ROLE_PERMISSIONS: RolePermissions = {
  superadmin: ['read', 'create', 'update', 'delete', 'admin'],
  admin: ['read', 'create', 'update', 'delete'],
  staff: ['read', 'create', 'update'],
  member: ['read'],
  visitor: ['read'],
  ministry_leader: ['read', 'create', 'update']
} as const

export class TenantContext {
  constructor(
    readonly organizationId: string,
    readonly userId: string,
    readonly role: UserRole,
    private readonly features?: string[]
  ) {}

  async canAccess(resource: string, action: string): Promise<boolean> {
    const allowedActions = ROLE_PERMISSIONS[this.role] || []
    return allowedActions.includes(action)
  }

  hasFeature(feature: string): boolean {
    return this.features?.includes(feature) ?? false
  }

  toHeaders(): Record<string, string> {
    return {
      'x-organization-id': this.organizationId,
      'x-user-id': this.userId,
      'x-user-role': this.role,
      'x-organization-features': JSON.stringify(this.features)
    }
  }
} 