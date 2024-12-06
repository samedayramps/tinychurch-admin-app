interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: number
}

export class Monitor {
  private static instance: Monitor
  private metrics: Metric[] = []

  private constructor() {}

  static getInstance(): Monitor {
    if (!this.instance) {
      this.instance = new Monitor()
    }
    return this.instance
  }

  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    }
    
    this.metrics.push(metric)
    
    // Log metric for development/debugging
    if (process.env.NODE_ENV !== 'production') {
      console.info('Metric:', metric)
    }
  }

  trackError(error: Error, context?: Record<string, any>): void {
    console.error('Application error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    })
  }
} 