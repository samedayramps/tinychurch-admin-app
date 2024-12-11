// middleware/auth/rbac.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'
import { log } from '@/lib/utils/logger'

export const rbacMiddleware: MiddlewareFactory = async (req, res, next) => {
  const requestId = crypto.randomUUID()
  const path = req.nextUrl.pathname

  log.info('RBAC middleware started', {
    requestId,
    path,
    method: req.method
  })

  try {
    // Validate required headers from previous middleware
    if (!validateRequiredHeaders(req, ['x-user-id', 'x-organization-id'], 'RBAC')) {
      log.error('Missing required headers for RBAC check', {
        requestId,
        path,
        headers: Object.fromEntries(req.headers)
      })
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const orgId = req.headers.get('x-organization-id')
    
    log.debug('Starting RBAC check', {
      requestId,
      userId,
      organizationId: orgId,
      path
    })

    const { supabase, response } = createMiddlewareClient(req)
    
    // Check if user is superadmin first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', userId)
      .single()

    if (profileError) {
      log.error('Failed to fetch user profile for RBAC check', {
        requestId,
        userId,
        error: profileError.message,
        code: profileError.code
      })
      return NextResponse.redirect(new URL('/error', req.url))
    }

    if (profile?.is_superadmin) {
      log.info('Superadmin access granted', {
        requestId,
        userId,
        path
      })
      // Superadmin has all permissions
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-user-role', 'superadmin')
      requestHeaders.set('x-is-superadmin', 'true')
      
      return next(
        new NextRequest(req.url, { headers: requestHeaders }),
        response
      )
    }

    log.debug('Checking organization membership', {
      requestId,
      userId,
      organizationId: orgId
    })

    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single()
      
    if (membershipError) {
      log.error('Failed to fetch organization membership', {
        requestId,
        userId,
        organizationId: orgId,
        error: membershipError.message,
        code: membershipError.code
      })
      return NextResponse.redirect(new URL('/error', req.url))
    }

    if (!membership) {
      log.warn('User not a member of organization', {
        requestId,
        userId,
        organizationId: orgId,
        path
      })
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    log.info('RBAC check successful', {
      requestId,
      userId,
      organizationId: orgId,
      role: membership.role,
      path
    })
    
    // Add role context
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-role', membership.role)
    requestHeaders.set('x-request-id', requestId)
    
    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    log.error('Unhandled error in RBAC middleware', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path
    })
    throw error // Let error middleware handle it
  }
}