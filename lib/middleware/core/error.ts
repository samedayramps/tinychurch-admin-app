import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { Monitor } from '@/lib/monitoring'
import { AppError, AuthError, PermissionError } from '@/lib/errors'

export const errorMiddleware: MiddlewareFactory = async (req, res, next) => {
  const monitor = Monitor.getInstance()
  const startTime = Date.now()

  try {
    const response = await next(req, res)
    monitor.trackMetric('middleware.duration', Date.now() - startTime, {
      path: req.nextUrl.pathname,
      success: 'true'
    })
    return response
  } catch (error) {
    monitor.trackMetric('middleware.duration', Date.now() - startTime, {
      path: req.nextUrl.pathname,
      success: 'false'
    })

    if (AppError.isAppError(error)) {
      monitor.trackError(error, { path: req.nextUrl.pathname })

      if (error instanceof AuthError) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
      if (error instanceof PermissionError) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Unhandled errors
    monitor.trackError(error as Error, { 
      path: req.nextUrl.pathname,
      unhandled: true 
    })
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
