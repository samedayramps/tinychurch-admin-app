import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function eventAccessMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get event ID from URL (/events/[id]/...)
  const eventId = request.nextUrl.pathname.split('/')[2]

  // Get event visibility and organization
  const { data: event } = await supabase
    .from('events')
    .select(`
      visibility_level,
      organization_id,
      organizer_id
    `)
    .eq('id', eventId)
    .single()

  if (!event) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Public events are accessible to all
  if (event.visibility_level === 'public') {
    return NextResponse.next()
  }

  // All other visibility levels require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Check user's role in the organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', event.organization_id)
    .single()

  // Handle different visibility levels
  switch (event.visibility_level) {
    case 'members_only':
      if (!membership) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
    case 'staff_only':
      if (!membership || !['admin', 'staff'].includes(membership.role)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
    case 'private':
      if (!membership?.role === 'admin' && event.organizer_id !== user.id) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      break
  }

  return NextResponse.next()
} 