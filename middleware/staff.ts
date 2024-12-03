import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function staffMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get organization context
  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Check if user is staff or admin in this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .in('role', ['admin', 'staff'])
    .single()

  if (!membership) {
    return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
  }

  return NextResponse.next()
} 