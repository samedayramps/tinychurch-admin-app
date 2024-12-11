// middleware/auth/superadmin.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { log } from '@/lib/utils/logger'

export const superadminMiddleware: MiddlewareFactory = async (req, res, next) => {
  const requestId = crypto.randomUUID()
  const path = req.nextUrl.pathname

  log.info('Superadmin middleware started', {
    requestId,
    path,
    method: req.method
  })

  try {
    const { supabase, response } = createMiddlewareClient(req)
    log.debug('Supabase client created for superadmin check', { requestId })
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      log.error('Failed to get user for superadmin check', {
        requestId,
        error: error.message,
        code: error.status,
        path
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    if (!user) {
      log.info('No authenticated user found for superadmin check', {
        requestId,
        path,
        redirectTo: '/sign-in'
      })
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    log.debug('Checking superadmin status', {
      requestId,
      userId: user.id
    })

    // Check if user is superadmin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (profileError) {
      log.error('Failed to fetch profile for superadmin check', {
        requestId,
        userId: user.id,
        error: profileError.message,
        code: profileError.code
      })
      return NextResponse.redirect(new URL('/error', req.url))
    }

    if (!profile?.is_superadmin) {
      log.warn('Non-superadmin attempted to access protected route', {
        requestId,
        userId: user.id,
        path
      })
      return NextResponse.redirect(new URL('/', req.url))
    }

    log.info('Superadmin access granted', {
      requestId,
      userId: user.id,
      path
    })

    // Add superadmin context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-is-superadmin', '1')
    requestHeaders.set('x-user-role', 'superadmin')
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-request-id', requestId)

    log.debug('Added superadmin headers to request', {
      requestId,
      headers: ['x-is-superadmin', 'x-user-role', 'x-user-id', 'x-request-id']
    })

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    log.error('Unhandled error in superadmin middleware', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path
    })
    return NextResponse.redirect(new URL('/error', req.url))
  }
}