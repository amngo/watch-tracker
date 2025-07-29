// Search-related types
export interface FilterState {
  mediaType: 'all' | 'movie' | 'tv'
  minRating: number[]
  year: string
  sortBy: 'popularity' | 'vote_average' | 'release_date' | 'title'
  sortDirection: 'asc' | 'desc'
}

export type SortOption = 'popularity' | 'vote_average' | 'release_date' | 'title'
export type SortDirection = 'asc' | 'desc'

export interface SearchFiltersProps {
  filters: FilterState
  onUpdateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export interface SearchInterfaceProps extends SearchFiltersProps {
  searchType: 'movie' | 'tv'
  onSetSearchType: (type: 'movie' | 'tv') => void
  query: string
  onSetQuery: (query: string) => void
  showFilters: boolean
  onToggleFilters: () => void
  getActiveFilterCount: () => number
}