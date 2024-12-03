import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function organizationMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get organization slug from URL (/org/[slug]/...)
  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Check if user has access to this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations!inner (slug)
    `)
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .single()

  if (!membership) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Add organization context to headers for downstream use
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-organization-role', membership.role)
  requestHeaders.set('x-organization-slug', orgSlug)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
} 