export interface TenantContext {
  organizationId: string
  userId: string
  role: string
  canAccess: (resource: string) => boolean
  hasFeature: (feature: string) => boolean
  toHeaders: () => Record<string, string>
} 