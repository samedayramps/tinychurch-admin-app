import { createClient } from '@/lib/utils/supabase/server'
import type { Database } from '@/database.types'

type ActivityEventType = Database['public']['Enums']['activity_event_type']

interface LogActivityOptions {
  userId: string
  eventType: ActivityEventType
  details: string
  metadata?: Record<string, any>
  organizationId?: string
  ipAddress?: string
  userAgent?: string
}

export async function logUserActivity({
  userId,
  eventType,
  details,
  metadata = {},
  organizationId,
  ipAddress,
  userAgent
}: LogActivityOptions) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      event_type: eventType,
      details,
      metadata,
      organization_id: organizationId,
      ip_address: ipAddress,
      user_agent: userAgent
    })

  if (error) {
    console.error('Error logging user activity:', error)
  }
} 