import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { superadminMiddleware } from './superadmin'
import { staffMiddleware } from './staff'
import { authMiddleware } from './auth'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Create supabase client with cookies
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

  // Handle superadmin routes
  if (request.nextUrl.pathname.startsWith('/superadmin')) {
    return superadminMiddleware(request, supabase)
  }

  // Handle staff routes
  if (request.nextUrl.pathname.startsWith('/org')) {
    return staffMiddleware(request, supabase)
  }

  // Handle authenticated routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return authMiddleware(request, supabase)
  }

  return response
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    '/superadmin/:path*',
    '/org/:path*',
    '/dashboard/:path*'
  ]
} 