export interface MetricTags {
  organization_id?: string
  user_id?: string
  operation: string
  status: 'success' | 'error'
}

export class Monitor {
  trackMetric(name: string, value: number, tags: MetricTags): void {
    console.info('Metric:', { name, value, tags })
  }

  trackDuration(name: string, tags: MetricTags): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.trackMetric(name, duration, tags)
    }
  }
} 