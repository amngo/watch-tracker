import { TimeRange } from '@/types'

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
