import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WatchStatus, TMDBMediaItem } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate progress percentage based on watch status and episode/runtime data
 */
export function calculateProgress(
  status: WatchStatus,
  currentEpisode?: number | null,
  totalEpisodes?: number | null,
  currentRuntime?: number | null,
  totalRuntime?: number | null
): number {
  switch (status) {
    case 'COMPLETED':
      return 100
    case 'WATCHING':
      // For TV shows, use episode progress
      if (currentEpisode && totalEpisodes) {
        return Math.round((currentEpisode / totalEpisodes) * 100)
      }
      // For movies, use runtime progress
      if (currentRuntime && totalRuntime) {
        return Math.round((currentRuntime / totalRuntime) * 100)
      }
      // Default for watching status
      return 50
    case 'PAUSED':
      // For TV shows, use episode progress
      if (currentEpisode && totalEpisodes) {
        return Math.round((currentEpisode / totalEpisodes) * 100)
      }
      // For movies, use runtime progress
      if (currentRuntime && totalRuntime) {
        return Math.round((currentRuntime / totalRuntime) * 100)
      }
      // Default for paused status
      return 25
    case 'PLANNED':
    case 'DROPPED':
    default:
      return 0
  }
}

/**
 * Format runtime in minutes to hours and minutes
 */
export function formatRuntime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Format episode count display
 */
export function formatEpisodeCount(current?: number | null, total?: number | null): string {
  if (!current && !total) return ''
  if (!current) return `/ ${total}`
  if (!total) return `${current}`
  return `${current} / ${total}`
}

/**
 * Convert TMDB media type to database MediaType enum
 */
export function convertTMDBMediaType(tmdbType: 'movie' | 'tv'): 'MOVIE' | 'TV' {
  return tmdbType === 'movie' ? 'MOVIE' : 'TV'
}

/**
 * Extract title from TMDB media item (handles both movies and TV shows)
 */
export function getTMDBTitle(media: TMDBMediaItem): string {
  return media.media_type === 'movie' ? media.title : media.name
}

/**
 * Extract release date from TMDB media item (handles both movies and TV shows)
 */
export function getTMDBReleaseDate(media: TMDBMediaItem): string | null {
  return media.media_type === 'movie' ? media.release_date || null : media.first_air_date || null
}