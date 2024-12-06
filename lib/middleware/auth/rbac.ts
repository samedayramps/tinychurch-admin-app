// middleware/auth/rbac.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'

export const rbacMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    // Validate required headers from previous middleware
    if (!validateRequiredHeaders(req, ['x-user-id', 'x-organization-id'], 'RBAC')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const orgId = req.headers.get('x-organization-id')
    const { supabase, response } = createMiddlewareClient(req)
    
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single()
      
    if (!membership) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // Add role context
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-role', membership.role)
    
    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('RBAC middleware error:', error)
    throw error // Let error middleware handle it
  }
}