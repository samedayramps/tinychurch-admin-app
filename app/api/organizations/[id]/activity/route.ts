import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'

interface ActivityLog {
  id: string
  organization_id: string
  action: string
  actor: string
  timestamp: string
  details?: Record<string, any>
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await context.params
    const { data, error } = await supabase
      .from('organization_activity_logs')
      .select('*')
      .eq('organization_id', resolvedParams.id)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) throw error

    // Ensure the data matches our expected type
    const activities: ActivityLog[] = data?.map(item => ({
      id: item.id,
      organization_id: item.organization_id,
      action: item.action,
      actor: item.actor,
      timestamp: item.timestamp,
      details: item.details
    })) ?? []

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching organization activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization activity' },
      { status: 500 }
    )
  }
} 