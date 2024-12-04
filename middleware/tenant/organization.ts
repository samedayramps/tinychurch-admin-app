import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import type { OrganizationMembership } from './types'
import { createMiddlewareClient } from '@/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'

export const organizationMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    // Validate required headers from previous middleware
    if (!validateRequiredHeaders(req, ['x-user-id'], 'Organization')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const { supabase, response } = createMiddlewareClient(req)
    
    // Get organization slug from URL (/org/[slug]/...)
    const orgSlug = req.nextUrl.pathname.split('/')[2]

    // Check if user has access to this organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organizations!inner (
          id,
          slug,
          settings
        )
      `)
      .eq('user_id', userId)
      .eq('organizations.slug', orgSlug)
      .single()

    if (error || !membership) {
      console.error('Organization access error:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }

    const typedMembership = membership as unknown as OrganizationMembership

    // Add organization context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-organization-role', typedMembership.role)
    requestHeaders.set('x-organization-slug', typedMembership.organizations.slug)
    requestHeaders.set('x-organization-id', typedMembership.organizations.id)
    requestHeaders.set(
      'x-organization-settings', 
      JSON.stringify(typedMembership.organizations.settings)
    )

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Organization middleware error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
} 