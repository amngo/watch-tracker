import type { WatchedItem, WatchedEpisode, EpisodeWatchStatus } from '@/types'

/**
 * Calculate flexible progress for TV shows that allows non-linear watching
 */
export function calculateFlexibleProgress(
  watchedItem: WatchedItem,
  totalSeasons?: number,
  totalEpisodes?: number
): number {
  if (watchedItem.mediaType === 'MOVIE') {
    // For movies, use existing runtime-based calculation
    if (watchedItem.currentRuntime && watchedItem.totalRuntime) {
      return Math.min((watchedItem.currentRuntime / watchedItem.totalRuntime) * 100, 100)
    }
    return watchedItem.status === 'COMPLETED' ? 100 : 0
  }

  // For TV shows, calculate based on watched episodes
  if (!watchedItem.watchedEpisodes || watchedItem.watchedEpisodes.length === 0) {
    // Fallback to legacy calculation
    if (watchedItem.currentEpisode && totalEpisodes) {
      return Math.min((watchedItem.currentEpisode / totalEpisodes) * 100, 100)
    }
    return watchedItem.status === 'COMPLETED' ? 100 : 0
  }

  // Count watched and skipped episodes
  const watchedCount = watchedItem.watchedEpisodes.filter(ep => 
    ep.status === 'WATCHED' || ep.status === 'SKIPPED'
  ).length

  const total = totalEpisodes || watchedItem.totalEpisodes || 0
  
  if (total === 0) return 0
  
  return Math.min((watchedCount / total) * 100, 100)
}

/**
 * Get episode status for a specific season and episode
 */
export function getEpisodeStatus(
  watchedItem: WatchedItem,
  seasonNumber: number,
  episodeNumber: number
): EpisodeWatchStatus {
  const episode = watchedItem.watchedEpisodes?.find(
    ep => ep.seasonNumber === seasonNumber && ep.episodeNumber === episodeNumber
  )
  return episode?.status || 'UNWATCHED'
}

/**
 * Calculate season progress based on flexible episode tracking
 */
export function calculateSeasonProgress(
  watchedItem: WatchedItem,
  seasonNumber: number,
  totalEpisodesInSeason: number
): {
  watchedCount: number
  skippedCount: number
  unwatchedCount: number
  progressPercentage: number
} {
  if (!watchedItem.watchedEpisodes) {
    return {
      watchedCount: 0,
      skippedCount: 0,
      unwatchedCount: totalEpisodesInSeason,
      progressPercentage: 0
    }
  }

  const seasonEpisodes = watchedItem.watchedEpisodes.filter(
    ep => ep.seasonNumber === seasonNumber
  )

  const watchedCount = seasonEpisodes.filter(ep => ep.status === 'WATCHED').length
  const skippedCount = seasonEpisodes.filter(ep => ep.status === 'SKIPPED').length
  const unwatchedCount = totalEpisodesInSeason - watchedCount - skippedCount

  const progressPercentage = totalEpisodesInSeason > 0 
    ? ((watchedCount + skippedCount) / totalEpisodesInSeason) * 100 
    : 0

  return {
    watchedCount,
    skippedCount,
    unwatchedCount,
    progressPercentage
  }
}

/**
 * Get the next unwatched episode across all seasons
 */
export function getNextUnwatchedEpisode(
  watchedItem: WatchedItem,
  allSeasons: { season_number: number; episode_count: number }[]
): { seasonNumber: number; episodeNumber: number } | null {
  if (!watchedItem.watchedEpisodes || !allSeasons.length) return null

  // Sort seasons by number
  const sortedSeasons = allSeasons.sort((a, b) => a.season_number - b.season_number)

  for (const season of sortedSeasons) {
    for (let episodeNum = 1; episodeNum <= season.episode_count; episodeNum++) {
      const status = getEpisodeStatus(watchedItem, season.season_number, episodeNum)
      if (status === 'UNWATCHED') {
        return {
          seasonNumber: season.season_number,
          episodeNumber: episodeNum
        }
      }
    }
  }

  return null
}

/**
 * Check if a season is completed (all episodes watched or skipped)
 */
export function isSeasonCompleted(
  watchedItem: WatchedItem,
  seasonNumber: number,
  totalEpisodesInSeason: number
): boolean {
  if (!watchedItem.watchedEpisodes) return false

  const seasonProgress = calculateSeasonProgress(watchedItem, seasonNumber, totalEpisodesInSeason)
  return seasonProgress.unwatchedCount === 0
}

/**
 * Get viewing statistics for the entire show
 */
export function getShowStatistics(
  watchedItem: WatchedItem,
  allSeasons: { season_number: number; episode_count: number }[]
): {
  totalEpisodes: number
  watchedEpisodes: number
  skippedEpisodes: number
  unwatchedEpisodes: number
  completedSeasons: number
  overallProgress: number
} {
  const totalEpisodes = allSeasons.reduce((sum, season) => sum + season.episode_count, 0)
  
  if (!watchedItem.watchedEpisodes) {
    return {
      totalEpisodes,
      watchedEpisodes: 0,
      skippedEpisodes: 0,
      unwatchedEpisodes: totalEpisodes,
      completedSeasons: 0,
      overallProgress: 0
    }
  }

  const watchedEpisodes = watchedItem.watchedEpisodes.filter(ep => ep.status === 'WATCHED').length
  const skippedEpisodes = watchedItem.watchedEpisodes.filter(ep => ep.status === 'SKIPPED').length
  const unwatchedEpisodes = totalEpisodes - watchedEpisodes - skippedEpisodes

  const completedSeasons = allSeasons.filter(season => 
    isSeasonCompleted(watchedItem, season.season_number, season.episode_count)
  ).length

  const overallProgress = totalEpisodes > 0 
    ? ((watchedEpisodes + skippedEpisodes) / totalEpisodes) * 100 
    : 0

  return {
    totalEpisodes,
    watchedEpisodes,
    skippedEpisodes,
    unwatchedEpisodes,
    completedSeasons,
    overallProgress
  }
}