// middleware/core/rateLimit.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'

const rateLimit = new Map<string, { count: number; reset: number }>()

const RATE_LIMITS = {
  authenticated: {
    limit: 200,      // 200 requests
    window: 60000,   // per 1 minute
  },
  unauthenticated: {
    limit: 50,       // 50 requests
    window: 60000,   // per 1 minute
  }
}

// Paths that bypass rate limiting completely
const BYPASS_PATHS = [
  '/_next',
  '/static',
  '/images',
  '/api/health',
  '/favicon.ico',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/accept-invite',
  '/auth/'  // All auth routes
]

async function isRateLimited(key: string | null, config: typeof RATE_LIMITS.authenticated) {
  if (!key) return false
  
  const now = Date.now()
  const record = rateLimit.get(key)
  
  if (!record || record.reset < now) {
    rateLimit.set(key, { 
      count: 1, 
      reset: now + config.window 
    })
    return false
  }
  
  if (record.count >= config.limit) {
    const remainingTime = Math.ceil((record.reset - now) / 1000)
    return { limited: true, remainingTime }
  }
  
  record.count++
  return false
}

export const rateLimitMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const path = req.nextUrl.pathname
    
    // Skip rate limiting for bypassed paths
    if (BYPASS_PATHS.some(prefix => path.startsWith(prefix))) {
      console.log(`Skipping rate limit for path: ${path}`)
      return next(req, res)
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    const sessionToken = req.cookies.get('session')?.value
    const isAuthenticated = !!sessionToken

    // Use different keys based on auth status
    const rateLimitKey = isAuthenticated 
      ? `auth:${sessionToken}:${clientIp}`
      : `unauth:${clientIp}`

    const config = isAuthenticated 
      ? RATE_LIMITS.authenticated 
      : RATE_LIMITS.unauthenticated

    const limitResult = await isRateLimited(rateLimitKey, config)

    if (limitResult && typeof limitResult === 'object' && limitResult.limited) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Too many attempts. Please try again in ${limitResult.remainingTime} seconds.`,
          retryAfter: limitResult.remainingTime
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(limitResult.remainingTime),
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + limitResult.remainingTime)
          }
        }
      )

      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Expose-Headers', 'Retry-After, X-RateLimit-Reset')

      return response
    }
    
    return next(req, res)
  } catch (error) {
    console.error('Rate limit middleware error:', error)
    return next(req, res)
  }
}