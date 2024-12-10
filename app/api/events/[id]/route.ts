import { createClient } from '@/lib/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getSuperAdminStatus } from '@/lib/auth/permissions'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    if (!isSuperAdmin) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const supabase = await createClient()
    const data = await request.json()
    const resolvedParams = await context.params

    const { error } = await supabase
      .from('calendar_events')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isSuperAdmin = await getSuperAdminStatus()
    if (!isSuperAdmin) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    const supabase = await createClient()
    const resolvedParams = await context.params
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const resolvedParams = await context.params
    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        organizations (name),
        profiles (email, full_name)
      `)
      .eq('id', resolvedParams.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 