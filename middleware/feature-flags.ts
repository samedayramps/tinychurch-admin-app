import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function featureFlagMiddleware(
  request: NextRequest,
  supabase: SupabaseClient,
  requiredFeature: string
) {
  const orgSlug = request.nextUrl.pathname.split('/')[2]

  // Get organization settings
  const { data: org } = await supabase
    .from('organizations')
    .select('settings')
    .eq('slug', orgSlug)
    .single()

  if (!org?.settings?.features_enabled?.[requiredFeature]) {
    return NextResponse.redirect(new URL(`/org/${orgSlug}`, request.url))
  }

  return NextResponse.next()
} 