import { useEffect, useRef, useCallback } from 'react'
import { useMedia } from './use-media'
import { logError } from '@/lib/logger'

// Background update configuration
const TV_SHOW_UPDATE_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const STORAGE_KEY = 'lastTVShowUpdate'

export function useBackgroundUpdates() {
  const { updateAllTVShowDetails } = useMedia()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isUpdatingRef = useRef(false)

  const getLastUpdateTime = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? new Date(stored) : null
    } catch {
      return null
    }
  }, [])

  const setLastUpdateTime = useCallback((date: Date) => {
    try {
      localStorage.setItem(STORAGE_KEY, date.toISOString())
    } catch (error) {
      logError('Failed to save last update time', error, {
        component: 'useBackgroundUpdates'
      })
    }
  }, [])

  const shouldUpdateTVShows = useCallback(() => {
    const lastUpdate = getLastUpdateTime()
    if (!lastUpdate) return true // First time, should update
    
    const timeSinceLastUpdate = Date.now() - lastUpdate.getTime()
    return timeSinceLastUpdate >= TV_SHOW_UPDATE_INTERVAL
  }, [getLastUpdateTime])

  const performBackgroundUpdate = useCallback(async () => {
    if (isUpdatingRef.current) {
      return // Already updating
    }

    try {
      isUpdatingRef.current = true
      
      // Only update TV shows with missing data to avoid overwhelming TMDB API
      const result = await updateAllTVShowDetails({
        forceUpdate: false,
        onlyMissingData: true,
      })

      if (result && result.totalProcessed > 0) {
        console.log(`Background update: Updated ${result.successfulUpdates}/${result.totalProcessed} TV shows`)
      }

      // Update the last update time
      setLastUpdateTime(new Date())
    } catch (error) {
      logError('Background TV show update failed', error, {
        component: 'useBackgroundUpdates'
      })
    } finally {
      isUpdatingRef.current = false
    }
  }, [updateAllTVShowDetails, setLastUpdateTime])

  const scheduleBackgroundUpdate = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Check immediately on mount
    if (shouldUpdateTVShows()) {
      // Delay initial update by 5 seconds to avoid blocking UI
      setTimeout(() => {
        performBackgroundUpdate()
      }, 5000)
    }

    // Set up periodic updates
    intervalRef.current = setInterval(() => {
      if (shouldUpdateTVShows()) {
        performBackgroundUpdate()
      }
    }, 60 * 60 * 1000) // Check every hour

  }, [shouldUpdateTVShows, performBackgroundUpdate])

  const forceUpdate = useCallback(async (options?: {
    forceAll?: boolean
  }) => {
    return await updateAllTVShowDetails({
      forceUpdate: options?.forceAll ?? false,
      onlyMissingData: !options?.forceAll,
    })
  }, [updateAllTVShowDetails])

  useEffect(() => {
    scheduleBackgroundUpdate()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [scheduleBackgroundUpdate])

  return {
    forceUpdate,
    isUpdating: isUpdatingRef.current,
    lastUpdateTime: getLastUpdateTime(),
    shouldUpdate: shouldUpdateTVShows(),
  }
}