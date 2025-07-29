import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FilterState {
  mediaType: 'all' | 'movie' | 'tv'
  minRating: number[]
  year: string
  sortBy: 'popularity' | 'vote_average' | 'release_date' | 'title'
  sortDirection: 'asc' | 'desc'
}

interface ActiveFiltersProps {
  appliedFilters: FilterState
  onUpdateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void
  onApplyFilters: () => void
  getActiveFilterCount: () => number
}

export function ActiveFilters({
  appliedFilters,
  onUpdateFilter,
  onApplyFilters,
  getActiveFilterCount,
}: ActiveFiltersProps) {
  if (getActiveFilterCount() === 0) return null

  const handleRemoveFilter = <K extends keyof FilterState>(key: K, defaultValue: FilterState[K]) => {
    onUpdateFilter(key, defaultValue)
    onApplyFilters()
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {appliedFilters.mediaType !== 'all' && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {appliedFilters.mediaType === 'movie' ? 'Movies' : 'TV Shows'}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => handleRemoveFilter('mediaType', 'all')}
          />
        </Badge>
      )}
      {appliedFilters.minRating[0] > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Rating ≥ {appliedFilters.minRating[0]}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => handleRemoveFilter('minRating', [0])}
          />
        </Badge>
      )}
      {appliedFilters.year && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Year: {appliedFilters.year}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => handleRemoveFilter('year', '')}
          />
        </Badge>
      )}
    </div>
  )
}