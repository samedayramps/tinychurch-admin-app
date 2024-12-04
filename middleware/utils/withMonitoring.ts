import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MiddlewareFactory } from '../types'
import { MiddlewareMonitor } from './monitoring'

export function withMonitoring(
  middleware: MiddlewareFactory,
  name: string
): MiddlewareFactory {
  return async (req: NextRequest, res: NextResponse, next) => {
    const monitor = MiddlewareMonitor.getInstance()
    const startTime = Date.now()
    
    try {
      const response = await middleware(req, res, next)
      const duration = Date.now() - startTime

      response.headers.set('x-middleware-duration', duration.toString())
      response.headers.set('x-middleware-name', name)

      await monitor.recordMetric(
        name,
        req,
        startTime,
        true,
        response.status
      )
      return response
    } catch (error) {
      await monitor.recordMetric(
        name,
        req,
        startTime,
        false
      )
      throw error
    }
  }
} 