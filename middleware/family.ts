import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function familyMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get family ID from URL (/families/[id]/...)
  const familyId = request.nextUrl.pathname.split('/')[2]

  // Check if user is a member of this family or has admin/staff access
  const { data: membership } = await supabase
    .from('family_members')
    .select(`
      *,
      families!inner (*),
      organization_members!inner (role)
    `)
    .eq('user_id', user.id)
    .eq('families.id', familyId)
    .single()

  if (!membership && !['admin', 'staff'].includes(membership?.organization_members?.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
} 