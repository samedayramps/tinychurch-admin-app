// middleware/auth/session.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { log } from '@/lib/utils/logger'

export const sessionMiddleware: MiddlewareFactory = async (req, res, next) => {
  const requestId = crypto.randomUUID()
  const path = req.nextUrl.pathname

  log.info('Session middleware started', {
    requestId,
    path,
    method: req.method
  })

  try {
    const { supabase, response } = createMiddlewareClient(req)
    log.debug('Supabase client created for session check', { requestId })

    // Skip session check for public paths
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path ||
      req.nextUrl.pathname.startsWith('/auth/')
    )
    
    if (isPublicPath) {
      log.debug('Skipping session check for public path', {
        requestId,
        path
      })
      return next(req, response)
    }
    
    // Use getUser instead of getSession for security
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      log.error('Session verification failed', {
        requestId,
        error: error.message,
        code: error.status,
        path
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    if (!user) {
      log.info('No authenticated user found in session', {
        requestId,
        path,
        redirectTo: '/sign-in'
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    log.debug('User verified, fetching session', {
      requestId,
      userId: user.id
    })
    
    // Get session only after verifying user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      log.error('Failed to fetch session after user verification', {
        requestId,
        userId: user.id,
        error: sessionError.message,
        code: sessionError.status
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    log.info('Session verified successfully', {
      requestId,
      userId: user.id,
      hasSession: !!session,
      path
    })
    
    // Add session info to request context
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)
    if (session?.access_token) {
      requestHeaders.set('x-session-token', session.access_token)
    }
    requestHeaders.set('x-request-id', requestId)
    
    log.debug('Added session headers to request', {
      requestId,
      headers: ['x-user-id', 'x-session-token', 'x-request-id']
    })
    
    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    log.error('Unhandled error in session middleware', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path
    })
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
}