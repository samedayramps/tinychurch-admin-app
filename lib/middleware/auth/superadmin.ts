// middleware/auth/superadmin.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'

export const superadminMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_superadmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Add superadmin context to headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-is-superadmin', '1')
    requestHeaders.set('x-user-role', 'superadmin')

    return next(
      new NextRequest(req.url, { headers: requestHeaders }),
      response
    )
  } catch (error) {
    console.error('Superadmin middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}