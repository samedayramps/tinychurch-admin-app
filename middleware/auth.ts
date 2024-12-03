import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getRedirectPath } from '@/lib/auth/redirects'
import { getUserProfile } from '@/lib/dal'

export async function authMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // Define public paths
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback']
  const isPublicPath = publicPaths.some(path => url.pathname.startsWith(path))

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (user && isPublicPath) {
    const profile = await getUserProfile(user.id)
    const redirectPath = await getRedirectPath(profile, true)
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return NextResponse.next()
} 