// middleware/auth/auth.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { log } from '@/lib/utils/logger'

export const authMiddleware: MiddlewareFactory = async (req, res, next) => {
  const requestId = crypto.randomUUID()
  
  try {
    log.info('Auth middleware started', {
      requestId,
      path: req.nextUrl.pathname
    })

    const { supabase, response } = createMiddlewareClient(req)
    
    // Check if path is public
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback', '/error']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path || 
      req.nextUrl.pathname.startsWith('/auth/')
    )

    if (isPublicPath) {
      return next(req, response)
    }

    // Get user without profile check first
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user || userError) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Add auth context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-request-id', requestId)
    requestHeaders.set('x-user-id', user.id)

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    log.error('Middleware error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.nextUrl.pathname
    })
    return NextResponse.redirect(new URL('/error', req.url))
  }
}