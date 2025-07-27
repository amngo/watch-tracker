'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorDisplayProps {
  error: Error | string
  retry?: () => void
  title?: string
  className?: string
}

export function ErrorDisplay({ error, retry, title = 'Something went wrong', className }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <CardDescription className="text-center mb-4 max-w-md">
          {errorMessage || 'An unexpected error occurred. Please try again.'}
        </CardDescription>
        {retry && (
          <Button onClick={retry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ErrorAlert({ error, className }: { error: Error | string; className?: string }) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {errorMessage || 'An error occurred'}
      </AlertDescription>
    </Alert>
  )
}

export function InlineError({ error }: { error: Error | string }) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <span>{errorMessage}</span>
    </div>
  )
}