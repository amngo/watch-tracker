import {
  SortAsc,
  SortDesc,
  Film,
  Star,
  Calendar,
  TrendingUp,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MediaCardSkeleton } from '@/components/ui/skeletons'
import { MediaResultCard } from './media-result-card'
import { ActiveFilters } from './active-filters'
import type { FilterState, SortOption, SortDirection } from '@/types/search'
import { MovieWithMediaType, TVWithMediaType } from 'tmdb-ts'

interface SearchResultsProps {
  query: string
  results: TVWithMediaType[] | MovieWithMediaType[]
  isLoading: boolean
  error: string | null
  appliedFilters: FilterState
  onUpdateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void
  onApplyFilters: () => void
  getActiveFilterCount: () => number
  onUpdateAppliedSort: (sortBy: SortOption, direction?: SortDirection) => void
  onAddMedia: (media: TVWithMediaType | MovieWithMediaType) => Promise<void>
  isItemInWatchlist: (id: number) => boolean
  mediaType: 'movie' | 'tv'
}

export function SearchResults({
  query,
  results,
  isLoading,
  error,
  appliedFilters,
  mediaType,
  onUpdateFilter,
  onApplyFilters,
  getActiveFilterCount,
  onUpdateAppliedSort,
  onAddMedia,
  isItemInWatchlist,
}: SearchResultsProps) {
  if (!query) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Results for &quot;{query}&quot;
            {results.length > 0 && (
              <Badge variant="outline">{results.length} results</Badge>
            )}
          </CardTitle>

          {results.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {appliedFilters.sortDirection === 'desc' ? (
                    <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onUpdateAppliedSort('popularity')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popularity
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateAppliedSort('vote_average')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rating
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateAppliedSort('release_date')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Release Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateAppliedSort('title')}>
                  <Film className="h-4 w-4 mr-2" />
                  Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Active Filters Display */}
        <ActiveFilters
          appliedFilters={appliedFilters}
          onUpdateFilter={onUpdateFilter}
          onApplyFilters={onApplyFilters}
          getActiveFilterCount={getActiveFilterCount}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Error searching: {error}</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4">
            {results.map(media => {
              const isInWatchlist = isItemInWatchlist(media.id)
              return (
                <MediaResultCard
                  key={media.id}
                  media={media}
                  isInWatchlist={isInWatchlist}
                  onAddMedia={onAddMedia}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
