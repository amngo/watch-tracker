import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface FilterState {
  mediaType: 'all' | 'movie' | 'tv'
  minRating: number[]
  year: string
  sortBy: 'popularity' | 'vote_average' | 'release_date' | 'title'
  sortDirection: 'asc' | 'desc'
}

interface SearchFiltersProps {
  filters: FilterState
  onUpdateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export function SearchFilters({
  filters,
  onUpdateFilter,
  onApplyFilters,
  onResetFilters,
}: SearchFiltersProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Media Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Media Type</label>
            <select
              value={filters.mediaType}
              onChange={e =>
                onUpdateFilter(
                  'mediaType',
                  e.target.value as FilterState['mediaType']
                )
              }
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
          </div>

          {/* Minimum Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Min Rating: {filters.minRating[0]}/10
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={filters.minRating[0]}
              onChange={e =>
                onUpdateFilter('minRating', [parseFloat(e.target.value)])
              }
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Release Year</label>
            <Input
              type="number"
              placeholder="e.g. 2024"
              value={filters.year}
              onChange={e => onUpdateFilter('year', e.target.value)}
              min="1900"
              max={new Date().getFullYear() + 2}
            />
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={e =>
                onUpdateFilter('sortBy', e.target.value as FilterState['sortBy'])
              }
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="popularity">Popularity</option>
              <option value="vote_average">Rating</option>
              <option value="release_date">Release Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onResetFilters}>
            Reset
          </Button>
          <Button onClick={onApplyFilters}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}