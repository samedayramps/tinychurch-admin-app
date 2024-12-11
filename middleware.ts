// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/utils/supabase/middleware'
import { log } from '@/lib/utils/logger'

export default async function middleware(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const path = req.nextUrl.pathname
  
  try {
    log.debug('Middleware started', {
      requestId,
      path,
      method: req.method
    })

    const { supabase, response } = createMiddlewareClient(req)

    // Refresh session if it exists
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      log.error('Session error in middleware', {
        requestId,
        error: error.message,
        path
      })
    }

    if (session) {
      log.debug('Active session found', {
        requestId,
        userId: session.user.id,
        path
      })
    }

    return response
  } catch (error) {
    log.error('Unhandled middleware error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path
    })
    return NextResponse.next()
  }
}

// Configure middleware matching
export const config = {
  matcher: [
    // Match all paths except static files and specific API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}