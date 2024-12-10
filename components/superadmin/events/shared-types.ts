import type { Database, Json } from '@/database.types'

// Base calendar event type from database
type BaseCalendarEvent = Database['public']['Tables']['calendar_events']['Row']

// JSON structures that match database constraints
export interface LocationJson {
  address: {
    street: string
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
    [key: string]: string | null | undefined
  }
  specific_location?: string | null
  [key: string]: any
}

export interface MetadataJson {
  is_public: boolean
  show_on_website: boolean
  requires_registration: boolean
  max_participants: number | null
}

// Extended calendar event type with proper JSON typing
export type CalendarEvent = Omit<BaseCalendarEvent, 'location' | 'metadata' | 'organizations'> & {
  location: LocationJson | null
  metadata: MetadataJson | null
  organizations?: {
    id: string
    name: string
  } | null
}

// Type guards and helper functions
export function isLocationJson(json: Json): json is LocationJson {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return false
  
  const loc = json as Record<string, unknown>
  if (!loc.address || typeof loc.address !== 'object' || Array.isArray(loc.address)) {
    return false
  }

  const address = loc.address as Record<string, unknown>
  return typeof address.street === 'string'
}

export const isMetadataJson = (value: unknown): value is MetadataJson => {
  if (!value || typeof value !== 'object') return false
  const meta = value as MetadataJson
  return (
    typeof meta === 'object' &&
    'is_public' in meta &&
    typeof meta.is_public === 'boolean' &&
    'show_on_website' in meta &&
    typeof meta.show_on_website === 'boolean' &&
    'requires_registration' in meta &&
    typeof meta.requires_registration === 'boolean' &&
    'max_participants' in meta &&
    (meta.max_participants === null || typeof meta.max_participants === 'number')
  )
}

// Helper function to format location display
export function formatLocation(location: LocationJson): string {
  const { address, specific_location } = location
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postal_code,
    address.country
  ].filter(Boolean)
  
  return [parts.join(', '), specific_location].filter(Boolean).join(' - ')
}

// Helper function to get metadata with defaults
export const getMetadata = (json: Json | null): MetadataJson => {
  if (json && isMetadataJson(json)) return json
  return {
    is_public: false,
    show_on_website: false,
    requires_registration: false,
    max_participants: null
  }
} 