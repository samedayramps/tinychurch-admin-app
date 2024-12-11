// middleware/auth/auth.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { log } from '@/lib/utils/logger'

const PUBLIC_PATHS = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/auth/callback'
]

const SUPERADMIN_PATHS = [
  '/superadmin',
  '/superadmin/dashboard'
]

const AUTH_PATHS = [
  '/dashboard',
  '/settings',
  '/profile'
]

export const authMiddleware: MiddlewareFactory = async (req, res, next) => {
  const requestId = crypto.randomUUID()
  const path = req.nextUrl.pathname
  
  log.info('Auth middleware started', {
    requestId,
    path,
    method: req.method
  })
  
  try {
    // Skip middleware for static files and API routes
    if (
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/api')
    ) {
      log.debug('Skipping auth middleware for excluded path', {
        requestId,
        path
      })
      return next(req, res)
    }

    const { supabase, response } = createMiddlewareClient(req)
    log.debug('Supabase client created', { requestId })

    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Handle authentication errors
    if (error) {
      log.error('Auth error in middleware', {
        requestId,
        error: error.message,
        code: error.status
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Get the user's profile for role-based redirects
    let profile = null
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()
      profile = profileData
    }

    // Handle public paths
    const isPublicPath = PUBLIC_PATHS.some(p => path.startsWith(p))
    if (isPublicPath) {
      if (user) {
        log.info('Authenticated user accessing public path, redirecting', {
          requestId,
          userId: user.id,
          path,
          isSuperAdmin: !!profile?.is_superadmin
        })
        // Redirect authenticated users away from public paths
        return NextResponse.redirect(
          new URL(profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard', req.url)
        )
      }
      return next(req, res)
    }

    // Handle unauthenticated users
    if (!user) {
      log.info('No authenticated user found', {
        requestId,
        path,
        redirectTo: '/sign-in'
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Handle superadmin paths
    const isSuperAdminPath = SUPERADMIN_PATHS.some(p => path.startsWith(p))
    if (isSuperAdminPath && !profile?.is_superadmin) {
      log.warn('Non-superadmin attempted to access superadmin path', {
        requestId,
        userId: user.id,
        path
      })
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Handle root path redirect
    if (path === '/') {
      log.info('Root path access, redirecting based on role', {
        requestId,
        userId: user.id,
        isSuperAdmin: !!profile?.is_superadmin
      })
      return NextResponse.redirect(
        new URL(profile?.is_superadmin ? '/superadmin/dashboard' : '/dashboard', req.url)
      )
    }

    log.info('User authenticated', {
      requestId,
      userId: user.id,
      email: user.email,
      path,
      isSuperAdmin: !!profile?.is_superadmin
    })

    // Add user info to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-request-id', requestId)
    if (profile?.is_superadmin) {
      requestHeaders.set('x-is-superadmin', '1')
    }

    log.debug('Added auth headers to request', {
      requestId,
      headers: ['x-user-id', 'x-request-id', ...(profile?.is_superadmin ? ['x-is-superadmin'] : [])]
    })

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    log.error('Unhandled error in auth middleware', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path
    })
    return NextResponse.redirect(new URL('/error', req.url))
  }
}