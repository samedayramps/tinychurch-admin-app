import { createClient } from '@/lib/utils/supabase/server'
import type { Database } from '@/database.types'

type ActivityEventType = 'user_action' | 'system' | 'auth' | 'organization'

interface LogActivityOptions {
  userId: string
  eventType: ActivityEventType
  details: string
  metadata?: Record<string, any>
  organizationId?: string
}

export async function logActivity({
  userId,
  eventType,
  details,
  metadata = {},
  organizationId,
}: LogActivityOptions) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      event_type: eventType,
      details,
      metadata,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging activity:', error)
  }
} 