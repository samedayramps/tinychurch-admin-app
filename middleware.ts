// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackMiddlewares } from '@/lib/middleware/stack'
import { loggingMiddleware } from '@/lib/middleware/core/logging'
import { rateLimitMiddleware } from '@/lib/middleware/core/rateLimit'
import { authMiddleware } from '@/lib/middleware/auth/auth'
import { sessionMiddleware } from '@/lib/middleware/auth/session'
import { impersonationMiddleware } from '@/lib/middleware/auth/impersonation'
import { superadminMiddleware } from '@/lib/middleware/auth/superadmin'
import { organizationMiddleware } from '@/lib/middleware/tenant/organization'
import { featureMiddleware } from '@/lib/middleware/tenant/features'
import { rbacMiddleware } from '@/lib/middleware/auth/rbac'
import { errorMiddleware } from '@/lib/middleware/core/error'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Define public paths that should only use core middleware
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/accept-invite', '/auth/callback']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith('/auth/')
  )

  // Core stack - always runs
  const coreStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
  ])

  // Create a next function for the final middleware
  const finalNext = async (req: NextRequest, res: NextResponse) => res

  // Auth stack - authentication and session management
  const authStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    impersonationMiddleware,
  ])

  // Organization stack - full context for org routes
  const orgStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    organizationMiddleware,
    rbacMiddleware,
    featureMiddleware,
  ])

  // Superadmin stack - special privileges
  const superadminStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    impersonationMiddleware,
    superadminMiddleware,  // Sets x-is-superadmin
  ])

  try {
    // For public paths, only use core middleware
    if (isPublicPath) {
      return await coreStack(request, response, finalNext)
    }

    // Route-specific middleware selection
    if (request.nextUrl.pathname.startsWith('/superadmin')) {
      if (request.nextUrl.pathname.startsWith('/superadmin/messaging')) {
        return await superadminStack(request, response, finalNext)
      }
      return await superadminStack(request, response, finalNext)
    }

    if (request.nextUrl.pathname.startsWith('/org/')) {
      return await orgStack(request, response, finalNext)
    }

    // Default auth stack for protected routes
    return await authStack(request, response, finalNext)
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}