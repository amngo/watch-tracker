'use client'

import React, { Component, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { logError } from '@/lib/logger'

interface OptimisticUpdateBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onRetry?: () => void
}

interface OptimisticUpdateBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

export class OptimisticUpdateBoundary extends Component<
  OptimisticUpdateBoundaryProps,
  OptimisticUpdateBoundaryState
> {
  private maxRetries = 3

  constructor(props: OptimisticUpdateBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<OptimisticUpdateBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    logError('OptimisticUpdateBoundary caught an error', error, {
      component: 'OptimisticUpdateBoundary',
      metadata: { 
        errorInfo: errorInfo.componentStack,
        retryCount: this.state.retryCount
      }
    })

    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))

      if (this.props.onRetry) {
        this.props.onRetry()
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              An error occurred while updating your data. Your changes may not have been saved.
            </p>
            
            <div className="flex gap-2">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
              >
                Dismiss
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Hook-based wrapper for easier usage
export function useOptimisticUpdateBoundary() {
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    logError('Optimistic update error', error, {
      component: 'useOptimisticUpdateBoundary',
      metadata: { retryCount }
    })
  }, [retryCount])

  const retry = React.useCallback(() => {
    setError(null)
    setRetryCount(prev => prev + 1)
  }, [])

  const reset = React.useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    error,
    retryCount,
    handleError,
    retry,
    reset,
    hasError: error !== null
  }
}