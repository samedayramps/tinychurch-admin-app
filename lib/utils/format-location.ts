import type { LocationJson } from '@/components/superadmin/events/shared-types'

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