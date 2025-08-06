import type { WatchedItem, EpisodeWatchStatus } from '@/types'
import { tmdb } from './tmdb'
import next from 'next'

export interface EpisodeInfo {
  seasonNumber: number
  episodeNumber: number
  episodeName?: string
  tmdbId: number
}

// Cache for episode names to avoid repeated API calls
const episodeNameCache = new Map<string, string>()

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
      return Math.min(
        (watchedItem.currentRuntime / watchedItem.totalRuntime) * 100,
        100
      )
    }
    return watchedItem.status === 'COMPLETED' ? 100 : 0
  }

  // For TV shows, calculate based on watched episodes
  if (
    !watchedItem.watchedEpisodes ||
    watchedItem.watchedEpisodes.length === 0
  ) {
    // Fallback to legacy calculation
    if (watchedItem.currentEpisode && totalEpisodes) {
      return Math.min((watchedItem.currentEpisode / totalEpisodes) * 100, 100)
    }
    return watchedItem.status === 'COMPLETED' ? 100 : 0
  }

  // Count watched and skipped episodes
  const watchedCount = watchedItem.watchedEpisodes.filter(
    ep => ep.status === 'WATCHED' || ep.status === 'SKIPPED'
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
      progressPercentage: 0,
    }
  }

  const seasonEpisodes = watchedItem.watchedEpisodes.filter(
    ep => ep.seasonNumber === seasonNumber
  )

  const watchedCount = seasonEpisodes.filter(
    ep => ep.status === 'WATCHED'
  ).length
  const skippedCount = seasonEpisodes.filter(
    ep => ep.status === 'SKIPPED'
  ).length
  const unwatchedCount = totalEpisodesInSeason - watchedCount - skippedCount

  const progressPercentage =
    totalEpisodesInSeason > 0
      ? ((watchedCount + skippedCount) / totalEpisodesInSeason) * 100
      : 0

  return {
    watchedCount,
    skippedCount,
    unwatchedCount,
    progressPercentage,
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
  const sortedSeasons = allSeasons.sort(
    (a, b) => a.season_number - b.season_number
  )

  for (const season of sortedSeasons) {
    for (let episodeNum = 1; episodeNum <= season.episode_count; episodeNum++) {
      const status = getEpisodeStatus(
        watchedItem,
        season.season_number,
        episodeNum
      )
      if (status === 'UNWATCHED') {
        return {
          seasonNumber: season.season_number,
          episodeNumber: episodeNum,
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

  const seasonProgress = calculateSeasonProgress(
    watchedItem,
    seasonNumber,
    totalEpisodesInSeason
  )
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
  const totalEpisodes = allSeasons.reduce(
    (sum, season) => sum + season.episode_count,
    0
  )

  if (!watchedItem.watchedEpisodes) {
    return {
      totalEpisodes,
      watchedEpisodes: 0,
      skippedEpisodes: 0,
      unwatchedEpisodes: totalEpisodes,
      completedSeasons: 0,
      overallProgress: 0,
    }
  }

  const watchedEpisodes = watchedItem.watchedEpisodes.filter(
    ep => ep.status === 'WATCHED'
  ).length
  const skippedEpisodes = watchedItem.watchedEpisodes.filter(
    ep => ep.status === 'SKIPPED'
  ).length
  const unwatchedEpisodes = totalEpisodes - watchedEpisodes - skippedEpisodes

  const completedSeasons = allSeasons.filter(season =>
    isSeasonCompleted(watchedItem, season.season_number, season.episode_count)
  ).length

  const overallProgress =
    totalEpisodes > 0
      ? ((watchedEpisodes + skippedEpisodes) / totalEpisodes) * 100
      : 0

  return {
    totalEpisodes,
    watchedEpisodes,
    skippedEpisodes,
    unwatchedEpisodes,
    completedSeasons,
    overallProgress,
  }
}

/**
 * Fetch episode name from TMDB
 */
export async function getEpisodeName(
  tmdbId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<string | null> {
  const cacheKey = `${tmdbId}-${seasonNumber}-${episodeNumber}`

  // Check cache first
  if (episodeNameCache.has(cacheKey)) {
    return episodeNameCache.get(cacheKey) || null
  }

  try {
    const episodeDetails = await tmdb.tvEpisode.details({
      tvShowID: tmdbId,
      seasonNumber,
      episodeNumber,
    })
    const episodeName = episodeDetails.name

    // Cache the result
    if (episodeName) {
      episodeNameCache.set(cacheKey, episodeName)
    }

    return episodeName
  } catch (error) {
    console.warn(`Failed to fetch episode name for ${cacheKey}:`, error)
    return null
  }
}

/**
 * Format episode display with episode name if available
 */
export function formatEpisodeDisplay(
  seasonNumber: number,
  episodeNumber: number,
  episodeName?: string | null
): string {
  const episodeCode = `S${seasonNumber.toString().padStart(2, '0')}E${episodeNumber.toString().padStart(2, '0')}`

  if (episodeName) {
    return `${episodeCode}: ${episodeName}`
  }

  return episodeCode
}

/**
 * Format episode reference for notes display
 */
export function formatEpisodeReference(
  seasonNumber: number,
  episodeNumber: number,
  episodeName?: string | null
): string {
  if (episodeName) {
    return `${episodeName} (S${seasonNumber}E${episodeNumber})`
  }

  return `Season ${seasonNumber}, Episode ${episodeNumber}`
}

/**
 * Determine the next episode to watch based on watched episodes
 * Handles season boundaries and missing season data
 */
export async function getNextEpisodeToWatch(watchedItem: WatchedItem): Promise<{
  seasonNumber: number
  episodeNumber: number
  formatted: string
} | null> {
  // If show is completed, there's no next episode
  if (watchedItem.status === 'COMPLETED') {
    return null
  }

  // If no episodes have been watched yet, start from S1E1
  if (
    !watchedItem.watchedEpisodes ||
    watchedItem.watchedEpisodes.length === 0
  ) {
    return {
      seasonNumber: 1,
      episodeNumber: 1,
      formatted: 'S1E1',
    }
  }

  // Find the highest watched episode
  const watchedEpisodes = watchedItem.watchedEpisodes.filter(
    ep => ep.status === 'WATCHED' || ep.status === 'SKIPPED'
  )

  if (watchedEpisodes.length === 0) {
    // If episodes exist but none are watched, start from S1E1
    return {
      seasonNumber: 1,
      episodeNumber: 1,
      formatted: 'S1E1',
    }
  }

  // Sort watched episodes to find the latest one
  const sortedWatched = [...watchedEpisodes].sort((a, b) => {
    if (a.seasonNumber !== b.seasonNumber) {
      return a.seasonNumber - b.seasonNumber
    }
    return a.episodeNumber - b.episodeNumber
  })

  const lastWatched = sortedWatched[sortedWatched.length - 1]

  // Try to find the next unwatched episode
  let nextSeason = lastWatched.seasonNumber
  let nextEpisode = lastWatched.episodeNumber + 1

  // Fetch season data if available
  const showDetails = await tmdb.tvShows.details(watchedItem.tmdbId)
  const seasonData = showDetails.seasons

  console.log('Season Data:', seasonData)

  // If we have season data, use it to check boundaries
  if (seasonData && seasonData.length > 0) {
    const currentSeasonData = seasonData.find(
      s => s.season_number === lastWatched.seasonNumber
    )

    if (currentSeasonData) {
      // Check if we've exceeded the episode count for this season
      if (nextEpisode > currentSeasonData.episode_count) {
        // Move to the next season
        nextSeason = lastWatched.seasonNumber + 1
        nextEpisode = 1

        // Check if this season exists
        const nextSeasonData = seasonData.find(
          s => s.season_number === nextSeason
        )

        if (!nextSeasonData) {
          // No more seasons available
          return null
        }
      }
    } else {
      // Current season data not found, try to be smart about it
      // Check if there's a watched episode in a higher season
      const higherSeasonEpisode = watchedEpisodes.find(
        ep => ep.seasonNumber > lastWatched.seasonNumber
      )

      if (higherSeasonEpisode) {
        // There are watched episodes in later seasons, so current season must be complete
        nextSeason = lastWatched.seasonNumber + 1
        nextEpisode = 1
      }
    }
  } else {
    // No season data available, use heuristics
    // Check if there's already a watched episode with the next episode number
    const nextEpisodeExists = watchedEpisodes.some(
      ep => ep.seasonNumber === nextSeason && ep.episodeNumber === nextEpisode
    )

    if (nextEpisodeExists) {
      // Find the next unwatched episode in this season
      const seasonEpisodes = watchedEpisodes
        .filter(ep => ep.seasonNumber === nextSeason)
        .map(ep => ep.episodeNumber)
        .sort((a, b) => a - b)

      // Find the first gap in episode numbers
      for (let i = 1; i <= Math.max(...seasonEpisodes) + 1; i++) {
        if (!seasonEpisodes.includes(i)) {
          nextEpisode = i
          break
        }
      }

      // If all episodes in this season seem watched, try next season
      if (nextEpisode > Math.max(...seasonEpisodes) + 1) {
        nextSeason += 1
        nextEpisode = 1
      }
    }

    // Use totalSeasons to check if we've exceeded available seasons
    if (watchedItem.totalSeasons && nextSeason > watchedItem.totalSeasons) {
      return null
    }
  }

  const formatted = `S${nextSeason}E${nextEpisode}`

  return {
    seasonNumber: nextSeason,
    episodeNumber: nextEpisode,
    formatted,
  }
}

/**
 * Get the next episode to watch using legacy current episode tracking
 * Fallback for when watchedEpisodes data is not available
 */
export function getNextEpisodeLegacy(
  watchedItem: WatchedItem
): { seasonNumber: number; episodeNumber: number; formatted: string } | null {
  if (watchedItem.status === 'COMPLETED') {
    return null
  }

  const currentSeason = watchedItem.currentSeason || 1
  const currentEpisode = watchedItem.currentEpisode || 0

  return {
    seasonNumber: currentSeason,
    episodeNumber: currentEpisode + 1,
    formatted: `S${currentSeason}E${currentEpisode + 1}`,
  }
}
