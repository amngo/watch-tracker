import { useCallback } from 'react'
import type { EpisodeWatchStatus, WatchedItem } from '@/types'

/**
 * Custom hook for managing episode watch actions and status
 * @param watchedItem - The watched item containing episodes
 * @param onUpdateEpisodeStatus - Callback to update episode status
 * @param onBulkUpdateEpisodes - Callback for bulk episode updates
 */
export function useEpisodeActions(
  watchedItem: WatchedItem,
  onUpdateEpisodeStatus: (
    seasonNumber: number,
    episodeNumber: number,
    status: EpisodeWatchStatus
  ) => void,
  onBulkUpdateEpisodes: (
    episodes: {
      seasonNumber: number
      episodeNumber: number
      status: EpisodeWatchStatus
    }[]
  ) => void
) {
  /**
   * Get episode status from watched episodes array
   */
  const getEpisodeStatus = useCallback(
    (seasonNumber: number, episodeNumber: number): EpisodeWatchStatus => {
      const episode = watchedItem.watchedEpisodes?.find(
        ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
      )
      return episode?.status || 'UNWATCHED'
    },
    [watchedItem.watchedEpisodes]
  )

  /**
   * Handle individual episode status change
   */
  const handleEpisodeStatusChange = useCallback(
    (seasonNumber: number, episodeNumber: number, status: EpisodeWatchStatus) => {
      onUpdateEpisodeStatus(seasonNumber, episodeNumber, status)
    },
    [onUpdateEpisodeStatus]
  )

  /**
   * Handle bulk episode actions
   */
  const handleBulkAction = useCallback(
    (selectedEpisodes: Set<number>, seasonNumber: number, action: EpisodeWatchStatus) => {
      const episodes = Array.from(selectedEpisodes).map(episodeNumber => ({
        seasonNumber,
        episodeNumber,
        status: action,
      }))
      onBulkUpdateEpisodes(episodes)
    },
    [onBulkUpdateEpisodes]
  )

  /**
   * Calculate season progress statistics
   */
  const calculateSeasonProgress = useCallback(
    (episodes: Array<{ episode_number: number }>, seasonNumber: number) => {
      const watchedCount = episodes.filter(
        ep => getEpisodeStatus(seasonNumber, ep.episode_number) === 'WATCHED'
      ).length

      const skippedCount = episodes.filter(
        ep => getEpisodeStatus(seasonNumber, ep.episode_number) === 'SKIPPED'
      ).length

      const totalCount = episodes.length
      const progress = totalCount > 0 ? ((watchedCount + skippedCount) / totalCount) * 100 : 0

      return {
        watchedCount,
        skippedCount,
        totalCount,
        remainingCount: totalCount - watchedCount - skippedCount,
        progress,
      }
    },
    [getEpisodeStatus]
  )

  return {
    getEpisodeStatus,
    handleEpisodeStatusChange,
    handleBulkAction,
    calculateSeasonProgress,
  }
}