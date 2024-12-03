import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function visibilityMiddleware(
  request: NextRequest,
  supabase: SupabaseClient,
  requiredLevel: 'public' | 'members_only' | 'staff_only' | 'private'
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public content is always accessible
  if (requiredLevel === 'public') {
    return NextResponse.next()
  }

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Check user's role in the organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .single()

  if (!membership) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Handle different visibility levels
  switch (requiredLevel) {
    case 'members_only':
      return NextResponse.next()
    case 'staff_only':
      if (!['admin', 'staff'].includes(membership.role)) {
        return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
      }
      break
    case 'private':
      if (membership.role !== 'admin') {
        return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
      }
      break
  }

  return NextResponse.next()
} 