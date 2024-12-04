// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { stackMiddlewares } from './middleware/stack'
import { loggingMiddleware } from './middleware/core/logging'
import { rateLimitMiddleware } from './middleware/core/rateLimit'
import { authMiddleware } from './middleware/auth/auth'
import { sessionMiddleware } from './middleware/auth/session'
import { impersonationMiddleware } from './middleware/auth/impersonation'
import { superadminMiddleware } from './middleware/auth/superadmin'
import { organizationMiddleware } from './middleware/tenant/organization'
import { featureMiddleware } from './middleware/tenant/features'
import { rbacMiddleware } from './middleware/auth/rbac'
import { errorMiddleware } from './middleware/core/error'
import { withMonitoring } from './middleware/utils/withMonitoring'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Define public paths that should only use core middleware
  const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/auth/callback']
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith('/auth/')
  )

  // Core stack - always runs
  const coreStack = stackMiddlewares([
    withMonitoring(errorMiddleware, 'error'),
    withMonitoring(loggingMiddleware, 'logging'),
    withMonitoring(rateLimitMiddleware, 'rateLimit'),
  ])

  // Create a next function for the final middleware
  const finalNext = async (req: NextRequest, res: NextResponse) => res

  // Auth stack - authentication and session management
  const authStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    withMonitoring(authMiddleware, 'auth'),
    withMonitoring(sessionMiddleware, 'session'),
    withMonitoring(impersonationMiddleware, 'impersonation'),
  ])

  // Organization stack - full context for org routes
  const orgStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    withMonitoring(organizationMiddleware, 'organization'),
    withMonitoring(rbacMiddleware, 'rbac'),
    withMonitoring(featureMiddleware, 'features'),
  ])

  // Superadmin stack - special privileges
  const superadminStack = stackMiddlewares([
    errorMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    authMiddleware,
    sessionMiddleware,
    withMonitoring(impersonationMiddleware, 'impersonation'),
    superadminMiddleware,  // Sets x-is-superadmin
  ])

  try {
    // For public paths, only use core middleware
    if (isPublicPath) {
      return await coreStack(request, response, finalNext)
    }

    // Route-specific middleware selection
    if (request.nextUrl.pathname.startsWith('/superadmin')) {
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
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}