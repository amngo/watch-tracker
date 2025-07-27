import { Search, Filter, Film, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchFilters } from './search-filters'

interface FilterState {
  mediaType: 'all' | 'movie' | 'tv'
  minRating: number[]
  year: string
  sortBy: 'popularity' | 'vote_average' | 'release_date' | 'title'
  sortDirection: 'asc' | 'desc'
}

interface SearchInterfaceProps {
  searchType: 'movie' | 'tv'
  onSetSearchType: (type: 'movie' | 'tv') => void
  query: string
  onSetQuery: (query: string) => void
  showFilters: boolean
  onToggleFilters: () => void
  filters: FilterState
  onUpdateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  getActiveFilterCount: () => number
}

export function SearchInterface({
  searchType,
  onSetSearchType,
  query,
  onSetQuery,
  showFilters,
  onToggleFilters,
  filters,
  onUpdateFilter,
  onApplyFilters,
  onResetFilters,
  getActiveFilterCount,
}: SearchInterfaceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Type Tabs */}
        <Tabs
          value={searchType}
          onValueChange={value => onSetSearchType(value as 'movie' | 'tv')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movie" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              TV Shows
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchType === 'movie' ? 'movies' : 'TV shows'}...`}
              value={query}
              onChange={e => onSetQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <SearchFilters
            filters={filters}
            onUpdateFilter={onUpdateFilter}
            onApplyFilters={onApplyFilters}
            onResetFilters={onResetFilters}
          />
        )}
      </CardContent>
    </Card>
  )
}