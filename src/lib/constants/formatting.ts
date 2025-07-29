// Date formatting constants and utilities
export const DATE_FORMAT_OPTIONS = {
  SHORT: {
    month: 'short' as const,
    day: 'numeric' as const,
    year: 'numeric' as const,
  },
  LONG: {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const,
  },
} as const

// Runtime formatting utilities
export const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return 'Unknown'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export const formatAirDate = (dateString: string | null): string => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS.SHORT)
}

// Time range labels
export type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  all: 'All Time',
} as const

// Sort option labels
export const SORT_OPTION_LABELS = {
  popularity: 'Popularity',
  vote_average: 'Rating',
  release_date: 'Release Date',
  title: 'Title',
} as const