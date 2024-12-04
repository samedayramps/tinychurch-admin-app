export interface OperationMetrics {
  count: number
  totalTime: number
  averageTime: number
  minTime: number
  maxTime: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, OperationMetrics> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  track(operation: string, duration: number): void {
    const current = this.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: -Infinity
    }

    current.count++
    current.totalTime += duration
    current.averageTime = current.totalTime / current.count
    current.minTime = Math.min(current.minTime, duration)
    current.maxTime = Math.max(current.maxTime, duration)

    this.metrics.set(operation, current)
  }

  getMetrics(operation?: string): Map<string, OperationMetrics> | OperationMetrics | undefined {
    if (operation) {
      return this.metrics.get(operation)
    }
    return this.metrics
  }

  reset(): void {
    this.metrics.clear()
  }
} 