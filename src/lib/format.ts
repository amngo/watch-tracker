/**
 * Shared formatting utilities for the application
 */

/**
 * Format air date string to localized date format
 */
export const formatAirDate = (dateString: string | null): string => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format runtime in minutes to human-readable format
 */
export const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return 'Unknown'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

/**
 * Format vote average to one decimal place
 */
export const formatVoteAverage = (voteAverage: number): string => {
  return voteAverage.toFixed(1)
}

/**
 * Format percentage to whole number
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`
}