'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react'

interface OptimisticIndicatorProps {
  status: 'pending' | 'success' | 'error' | 'idle'
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  pending: {
    icon: Loader2,
    text: 'Saving...',
    className: 'text-blue-500 animate-spin',
    bgClassName: 'bg-blue-50 border-blue-200'
  },
  success: {
    icon: CheckCircle,
    text: 'Saved',
    className: 'text-green-500',
    bgClassName: 'bg-green-50 border-green-200'
  },
  error: {
    icon: XCircle,
    text: 'Failed',
    className: 'text-red-500',
    bgClassName: 'bg-red-50 border-red-200'
  },
  idle: {
    icon: Clock,
    text: '',
    className: 'text-gray-400',
    bgClassName: 'bg-gray-50 border-gray-200'
  }
}

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    text: 'text-xs',
    container: 'px-2 py-1'
  },
  md: {
    icon: 'h-4 w-4',
    text: 'text-sm',
    container: 'px-3 py-1.5'
  },
  lg: {
    icon: 'h-5 w-5',
    text: 'text-base',
    container: 'px-4 py-2'
  }
}

export function OptimisticIndicator({
  status,
  className,
  showText = true,
  size = 'sm'
}: OptimisticIndicatorProps) {
  const config = statusConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  if (status === 'idle') {
    return null
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-all duration-200',
        config.bgClassName,
        sizeStyles.container,
        className
      )}
    >
      <Icon className={cn(sizeStyles.icon, config.className)} />
      {showText && config.text && (
        <span className={cn('font-medium', sizeStyles.text, config.className)}>
          {config.text}
        </span>
      )}
    </div>
  )
}

// Badge-style indicator for cards and list items
export function OptimisticBadge({
  status,
  className,
  size = 'sm'
}: OptimisticIndicatorProps) {
  const config = statusConfig[status]
  const sizeStyles = sizeConfig[size]
  const Icon = config.icon

  if (status === 'idle') {
    return null
  }

  return (
    <div
      className={cn(
        'absolute -top-1 -right-1 rounded-full p-1 shadow-sm border-2 border-white bg-white',
        className
      )}
    >
      <Icon className={cn(sizeStyles.icon, config.className)} />
    </div>
  )
}

// Hook to manage optimistic update status
export function useOptimisticStatus(initialStatus: OptimisticIndicatorProps['status'] = 'idle') {
  const [status, setStatus] = React.useState<OptimisticIndicatorProps['status']>(initialStatus)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const setPending = React.useCallback(() => {
    setStatus('pending')
  }, [])

  const setSuccess = React.useCallback((autoHide = true, delay = 2000) => {
    setStatus('success')
    
    if (autoHide) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setStatus('idle')
      }, delay)
    }
  }, [])

  const setError = React.useCallback((autoHide = true, delay = 3000) => {
    setStatus('error')
    
    if (autoHide) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setStatus('idle')
      }, delay)
    }
  }, [])

  const setIdle = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setStatus('idle')
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    status,
    setPending,
    setSuccess,
    setError,
    setIdle
  }
}