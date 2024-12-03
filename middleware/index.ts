import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserProfile } from '@/lib/dal'
import { impersonationMiddleware } from './impersonation'
import { superadminMiddleware } from './superadmin'
import { startImpersonation, stopImpersonation } from '@/lib/dal/auth'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Create supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // Define public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password']
  const isPublicPath = publicPaths.includes(url.pathname)

  if (!user && !isPublicPath) {
    // Redirect unauthenticated users to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (user && isPublicPath) {
    // Redirect authenticated users away from auth pages
    const profile = await getUserProfile(user.id)
    const redirectUrl = profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Run impersonation middleware first
  const impersonationResponse = await impersonationMiddleware(request, supabase)
  if (impersonationResponse.status !== 200) {
    return impersonationResponse
  }

  // Handle superadmin routes
  if (request.nextUrl.pathname.startsWith('/superadmin')) {
    return superadminMiddleware(request, supabase)
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const impersonationData = session.user.app_metadata?.impersonation
    
    if (impersonationData) {
      console.log('Found impersonation metadata:', impersonationData)
      
      // Verify impersonation hasn't expired
      const startedAt = impersonationData.started_at * 1000
      const MAX_DURATION = 60 * 60 * 1000 // 1 hour
      
      console.log('Checking impersonation expiration:', {
        startedAt: new Date(startedAt),
        now: new Date(),
        timeRemaining: MAX_DURATION - (Date.now() - startedAt)
      })
      
      if (Date.now() - startedAt > MAX_DURATION) {
        console.log('Impersonation expired, stopping...')
        await stopImpersonation()
        return response
      }
      
      // Add context to request
      request.headers.set('x-real-user-id', impersonationData.original_user)
      request.headers.set('x-impersonating-id', impersonationData.impersonating)
      
      console.log('Added impersonation headers:', {
        realUserId: impersonationData.original_user,
        impersonatingId: impersonationData.impersonating
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add all paths that need protection
    '/superadmin/:path*',
    '/dashboard/:path*',
    '/org/:path*',
    '/families/:path*',
    '/ministries/:path*',
    '/account/:path*',
    '/auth/:path*',
    '/',
    // Exclude static files and API routes
    '/((?!api|_next/static|_next/image|favicon|.*\\.).*)'
  ]
} 