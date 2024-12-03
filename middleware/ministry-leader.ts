import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function ministryLeaderMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get ministry ID from URL (/ministries/[id]/...)
  const ministryId = request.nextUrl.pathname.split('/')[2]

  // Check if user is a leader of this ministry or has admin access
  const { data: ministry } = await supabase
    .from('ministries')
    .select(`
      *,
      organization_members!inner (role)
    `)
    .eq('leader_id', user.id)
    .eq('id', ministryId)
    .single()

  if (!ministry && ministry?.organization_members?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
} 