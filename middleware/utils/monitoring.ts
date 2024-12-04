import { NextRequest, NextResponse } from 'next/server'

interface MiddlewareMetrics {
  name: string
  duration: number
  success: boolean
  path: string
  statusCode?: number
}

export class MiddlewareMonitor {
  private static instance: MiddlewareMonitor
  private metrics: MiddlewareMetrics[] = []

  private constructor() {}

  static getInstance(): MiddlewareMonitor {
    if (!MiddlewareMonitor.instance) {
      MiddlewareMonitor.instance = new MiddlewareMonitor()
    }
    return MiddlewareMonitor.instance
  }

  async recordMetric(
    name: string,
    req: NextRequest,
    startTime: number,
    success: boolean,
    statusCode?: number
  ): Promise<void> {
    const duration = Date.now() - startTime
    const metric: MiddlewareMetrics = {
      name,
      duration,
      success,
      path: req.nextUrl.pathname,
      statusCode
    }

    this.metrics.push(metric)
    console.log('Middleware Metric:', metric)
  }
} 