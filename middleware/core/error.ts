import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'

export const errorMiddleware: MiddlewareFactory = async (req, res, next) => {
  try {
    return await next(req, res)
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Handle different types of errors
    if (error instanceof Error) {
      // Auth errors
      if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
      
      // Permission errors
      if (error.message.includes('permission') || error.message.includes('forbidden')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      
      // Organization errors
      if (error.message.includes('organization')) {
        return NextResponse.redirect(new URL('/organizations', req.url))
      }
    }
    
    // Default error handling
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
