import type { Database } from '@/database.types'

export interface OrganizationData {
  id: string
  slug: string
  settings: Record<string, any>
}

export interface OrganizationMembership {
  role: string
  organizations: OrganizationData
}

export interface FeatureSettings {
  features_enabled: string[]
  [key: string]: any
}

export function getRequestedFeature(pathname: string): string | null {
  const featureMap: Record<string, string> = {
    '/events': 'events',
    '/members': 'members',
    '/communications': 'communications',
    // Add other feature mappings
  }
  
  const path = pathname.split('/')[3] // Get feature path after /org/[slug]/
  return featureMap[path] || null
} 