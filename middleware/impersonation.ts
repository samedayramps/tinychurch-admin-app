import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function impersonationMiddleware(
  request: NextRequest,
  supabase: SupabaseClient
) {
  // Get impersonation cookie
  const impersonatingId = request.cookies.get('impersonating_user_id')?.value
  
  if (impersonatingId) {
    // Verify the actual user is a superadmin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Clear invalid impersonation
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      response.cookies.delete('impersonating_user_id')
      return response
    }

    // Verify superadmin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_superadmin) {
      // Clear unauthorized impersonation
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('impersonating_user_id')
      return response
    }

    // Add impersonation context to headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-impersonating-id', impersonatingId)
    requestHeaders.set('x-real-user-id', user.id)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
} 