import { useCallback } from 'react'
import { useLocalStorageState } from './use-local-storage-state'
import { EPISODE_CONSTANTS } from '@/lib/constants/episode'

/**
 * Custom hook for managing individual episode spoiler visibility states
 * @param watchedItemId - ID of the watched item (show/movie)
 * @returns utilities for managing episode spoiler states
 */
export function useEpisodeSpoilerState(watchedItemId: string) {
  const [spoilerStates, setSpoilerStates] = useLocalStorageState<Record<string, boolean>>(
    EPISODE_CONSTANTS.SPOILER_STORAGE_KEY,
    {}
  )

  /**
   * Generate unique key for episode spoiler state
   */
  const getEpisodeKey = useCallback(
    (seasonNumber: number, episodeNumber: number) => 
      `${watchedItemId}-s${seasonNumber}-e${episodeNumber}`,
    [watchedItemId]
  )

  /**
   * Get spoiler visibility for specific episode
   */
  const getEpisodeSpoilerVisible = useCallback(
    (seasonNumber: number, episodeNumber: number): boolean => {
      const key = getEpisodeKey(seasonNumber, episodeNumber)
      return spoilerStates[key] || false
    },
    [spoilerStates, getEpisodeKey]
  )

  /**
   * Toggle spoiler visibility for specific episode
   */
  const toggleEpisodeSpoiler = useCallback(
    (seasonNumber: number, episodeNumber: number) => {
      const key = getEpisodeKey(seasonNumber, episodeNumber)
      setSpoilerStates(prev => ({
        ...prev,
        [key]: !prev[key]
      }))
    },
    [getEpisodeKey, setSpoilerStates]
  )

  /**
   * Set spoiler visibility for specific episode
   */
  const setEpisodeSpoilerVisible = useCallback(
    (seasonNumber: number, episodeNumber: number, visible: boolean) => {
      const key = getEpisodeKey(seasonNumber, episodeNumber)
      setSpoilerStates(prev => ({
        ...prev,
        [key]: visible
      }))
    },
    [getEpisodeKey, setSpoilerStates]
  )

  /**
   * Clear all spoiler states for this watched item
   */
  const clearSpoilerStates = useCallback(() => {
    setSpoilerStates(prev => {
      const filtered = Object.fromEntries(
        Object.entries(prev).filter(([key]) => !key.startsWith(`${watchedItemId}-`))
      )
      return filtered
    })
  }, [watchedItemId, setSpoilerStates])

  return {
    getEpisodeSpoilerVisible,
    toggleEpisodeSpoiler,
    setEpisodeSpoilerVisible,
    clearSpoilerStates,
  }
}