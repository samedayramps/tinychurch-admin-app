import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getSuperAdminStatus } from '@/lib/auth/permissions'

export async function POST(request: Request) {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    if (!isSuperAdmin) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const supabase = await createClient()
    const data = await request.json()

    const { error } = await supabase
      .from('calendar_events')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const supabase = await createClient()
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        organizations (name),
        profiles (email, full_name)
      `)
      .order('start_date', { ascending: true })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    if (startDate) {
      query = query.gte('start_date', startDate)
    }

    if (endDate) {
      query = query.lte('start_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 