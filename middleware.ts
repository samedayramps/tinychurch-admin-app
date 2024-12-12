// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

export async function middleware(request: NextRequest) {
  // Only cache GET requests to specific API endpoints
  if (request.method === 'GET' && 
      (request.nextUrl.pathname.startsWith('/api/auth/') ||
       request.nextUrl.pathname.startsWith('/api/users/'))) {
    
    const cacheKey = request.nextUrl.pathname + request.nextUrl.search
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }
    
    const response = await fetch(request)
    const data = await response.json()
    
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
    
    return NextResponse.json(data)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}