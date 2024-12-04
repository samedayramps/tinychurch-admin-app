// middleware/core/logging.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '../types'

export const loggingMiddleware: MiddlewareFactory = async (req, res, next) => {
  const start = Date.now()
  
  try {
    const response = await next(req, res)
    const duration = Date.now() - start
    
    // Log request details
    console.log({
      method: req.method,
      path: req.nextUrl.pathname,
      duration,
      status: response.status,
    })
    
    return response
  } catch (error) {
    console.error('Logging middleware error:', error)
    throw error
  }
}