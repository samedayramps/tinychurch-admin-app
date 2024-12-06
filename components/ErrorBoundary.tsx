'use client'

import { Component, ReactNode } from 'react'
import { Monitor } from '@/lib/monitoring'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Monitor.getInstance().trackError(error, {
      componentStack: errorInfo.componentStack
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4">
          <h2 className="text-lg font-bold">Something went wrong</h2>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-2 text-sm text-red-600">
              {this.state.error?.message}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
} 