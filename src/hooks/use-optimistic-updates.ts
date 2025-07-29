import { useCallback, useRef } from 'react'
import { showToast } from '@/components/common/toast-provider'
import { logError } from '@/lib/logger'

export interface OptimisticUpdateOptions<T = unknown> {
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  component?: string
  retryCount?: number
  retryDelay?: number
}

export function useOptimisticUpdates() {
  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const executeOptimisticUpdate = useCallback(async <T>(
    optimisticAction: () => void,
    serverAction: () => Promise<T>,
    rollbackAction: () => void,
    options: OptimisticUpdateOptions<T> = {}
  ): Promise<T | null> => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage = 'Operation failed',
      component = 'OptimisticUpdate',
      retryCount = 0,
      retryDelay = 1000
    } = options

    // Apply optimistic update immediately
    optimisticAction()

    try {
      // Execute server action
      const result = await serverAction()
      
      // Success callback
      if (onSuccess) {
        onSuccess(result)
      }
      
      // Show success message
      if (successMessage) {
        showToast.success(successMessage)
      }

      return result
    } catch (error) {
      // Rollback optimistic update
      rollbackAction()

      const errorObj = error instanceof Error ? error : new Error(String(error))
      
      // Log error for debugging
      logError(`Optimistic update failed in ${component}`, errorObj, {
        component,
        metadata: {
          retryCount,
          timestamp: new Date().toISOString()
        }
      })

      // Handle retry logic
      if (retryCount > 0) {
        const retryId = `${component}-${Date.now()}`
        
        showToast.error(`${errorMessage}. Retrying...`)
        
        const retryTimeout = setTimeout(async () => {
          retryTimeoutsRef.current.delete(retryId)
          
          try {
            await executeOptimisticUpdate(
              optimisticAction,
              serverAction,
              rollbackAction,
              { ...options, retryCount: retryCount - 1 }
            )
          } catch (_retryError) {
            // Final failure after retries
            showToast.error(`${errorMessage} after ${options.retryCount} retries`)
          }
        }, retryDelay)
        
        retryTimeoutsRef.current.set(retryId, retryTimeout)
      } else {
        // Show error message
        showToast.error(errorMessage)
        
        // Error callback
        if (onError) {
          onError(errorObj)
        }
      }

      return null
    }
  }, [])

  const clearRetries = useCallback(() => {
    retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    retryTimeoutsRef.current.clear()
  }, [])

  return {
    executeOptimisticUpdate,
    clearRetries
  }
}

// Specialized hook for media operations
export function useOptimisticMediaUpdates() {
  const { executeOptimisticUpdate, clearRetries } = useOptimisticUpdates()

  const updateMediaItem = useCallback(async <T>(
    itemId: string,
    optimisticUpdate: () => void,
    serverUpdate: () => Promise<T>,
    rollbackUpdate: () => void,
    options: Omit<OptimisticUpdateOptions<T>, 'component'> = {}
  ) => {
    return executeOptimisticUpdate(
      optimisticUpdate,
      serverUpdate,
      rollbackUpdate,
      {
        ...options,
        component: 'MediaUpdate',
        retryCount: options.retryCount ?? 2,
        errorMessage: options.errorMessage ?? 'Failed to update media item'
      }
    )
  }, [executeOptimisticUpdate])

  const addMediaItem = useCallback(async <T>(
    optimisticAdd: () => void,
    serverAdd: () => Promise<T>,
    rollbackAdd: () => void,
    options: Omit<OptimisticUpdateOptions<T>, 'component'> = {}
  ) => {
    return executeOptimisticUpdate(
      optimisticAdd,
      serverAdd,
      rollbackAdd,
      {
        ...options,
        component: 'MediaAdd',
        retryCount: options.retryCount ?? 1,
        successMessage: options.successMessage ?? 'Media added successfully!',
        errorMessage: options.errorMessage ?? 'Failed to add media item'
      }
    )
  }, [executeOptimisticUpdate])

  const removeMediaItem = useCallback(async <T>(
    itemId: string,
    optimisticRemove: () => void,
    serverRemove: () => Promise<T>,
    rollbackRemove: () => void,
    options: Omit<OptimisticUpdateOptions<T>, 'component'> = {}
  ) => {
    return executeOptimisticUpdate(
      optimisticRemove,
      serverRemove,
      rollbackRemove,
      {
        ...options,
        component: 'MediaRemove',
        retryCount: options.retryCount ?? 1,
        successMessage: options.successMessage ?? 'Media removed successfully!',
        errorMessage: options.errorMessage ?? 'Failed to remove media item'
      }
    )
  }, [executeOptimisticUpdate])

  return {
    updateMediaItem,
    addMediaItem,
    removeMediaItem,
    clearRetries
  }
}