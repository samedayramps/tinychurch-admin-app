import type { MiddlewareFactory } from '../types'
import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { validateRequiredHeaders } from '../utils/headers'

interface OrganizationResponse {
  role: string
  organizations: {
    id: string
    slug: string
    settings: Record<string, any>
  }
}

export const tenantMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    if (!validateRequiredHeaders(req, ['x-user-id'], 'Tenant')) {
      return NextResponse.redirect(new URL('/error', req.url))
    }

    const userId = req.headers.get('x-user-id')
    const orgSlug = req.nextUrl.pathname.split('/')[2]
    const { supabase, response } = createMiddlewareClient(req)
    
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
      console.error('Tenant access error:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }

    const typedMembership = membership as unknown as OrganizationResponse
    const { role, organizations } = typedMembership

    // Set all context headers at once
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-role', role)
    requestHeaders.set('x-organization-id', organizations.id)
    requestHeaders.set('x-organization-slug', organizations.slug)
    requestHeaders.set('x-organization-settings', JSON.stringify(organizations.settings))

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Tenant middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
