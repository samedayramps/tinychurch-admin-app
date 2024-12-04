// middleware/core/rateLimit.ts
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'

// Simple in-memory store (use proper rate limiting solution in production)
const rateLimit = new Map<string, { count: number; reset: number }>()

async function isRateLimited(key: string | null, limit = 10) {
  if (!key) return false
  
  const now = Date.now()
  const record = rateLimit.get(key)
  
  if (!record || record.reset < now) {
    rateLimit.set(key, { count: 1, reset: now + 60000 }) // 1 minute window
    return false
  }
  
  if (record.count >= limit) {
    return true
  }
  
  record.count++
  return false
}

export const rateLimitMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    const orgId = req.headers.get('x-organization-id')
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limit by organization and IP
    const isLimited = await isRateLimited(`${orgId}:${clientIp}`)
    
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    return next(req, res)
  } catch (error) {
    console.error('Rate limit middleware error:', error)
    return next(req, res) // Continue on rate limit error
  }
}