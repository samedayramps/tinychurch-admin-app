// middleware/auth/impersonation.ts
import { NextResponse, NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { createMiddlewareClient } from '@/utils/supabase/middleware'

export const impersonationMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const { supabase, response } = createMiddlewareClient(req)
    const impersonatingId = req.cookies.get('impersonating_user_id')?.value
    
    if (impersonatingId) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Clear invalid impersonation
        const response = NextResponse.redirect(new URL('/sign-in', req.url))
        response.cookies.delete('impersonating_user_id')
        return response
      }

      // Verify superadmin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_superadmin) {
        // Clear unauthorized impersonation
        const response = NextResponse.redirect(new URL('/', req.url))
        response.cookies.delete('impersonating_user_id')
        return response
      }

      // Add impersonation context to headers
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set('x-impersonating-id', impersonatingId)
      requestHeaders.set('x-real-user-id', user.id)

      return next(
        new NextRequest(req.url, { headers: requestHeaders }),
        response
      )
    }

    return next(req, res)
  } catch (error) {
    console.error('Impersonation middleware error:', error)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}