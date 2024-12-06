// middleware/auth/session.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'

export const sessionMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    
    // Skip session check for public paths
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path ||
      req.nextUrl.pathname.startsWith('/auth/')
    )
    
    if (isPublicPath) {
      return next(req, response)
    }
    
    // Use getUser instead of getSession for security
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user || error) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    
    // Get session only after verifying user
    const { data: { session } } = await supabase.auth.getSession()
    
    // Add session info to request context
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)
    if (session?.access_token) {
      requestHeaders.set('x-session-token', session.access_token)
    }
    
    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Session middleware error:', error)
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
}