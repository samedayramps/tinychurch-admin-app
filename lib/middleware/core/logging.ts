// middleware/core/logging.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '../types'

export const loggingMiddleware: MiddlewareFactory = async (req, res, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()
  
  try {
    const response = await next(req, res)
    const duration = Date.now() - start
    
    // Structured logging
    console.log(JSON.stringify({
      requestId,
      method: req.method,
      path: req.nextUrl.pathname,
      duration,
      status: response.status,
      timestamp: new Date().toISOString()
    }))
    
    return response
  } catch (error) {
    console.error('Request error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.nextUrl.pathname
    })
    throw error
  }
}