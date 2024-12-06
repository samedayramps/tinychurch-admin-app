// middleware/auth/auth.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'

export const authMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    
    const { data: { user } } = await supabase.auth.getUser()

    // Define public paths that don't need auth
    const publicPaths = [
      '/sign-in', 
      '/sign-up', 
      '/forgot-password', 
      '/accept-invite', 
      '/auth/callback'
    ]
    
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path || // Exact match
      req.nextUrl.pathname.startsWith('/auth/') // All auth routes
    )

    // Allow public paths even without authentication
    if (isPublicPath) {
      return next(req, response)
    }

    // Redirect to sign-in if not authenticated and trying to access protected route
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Add auth context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
}