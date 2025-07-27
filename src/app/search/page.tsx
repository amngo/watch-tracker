'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Film,
  Tv,
  Star,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MediaPoster } from '@/components/ui/media-poster'
import { MediaTypeBadge, VoteAverageBadge } from '@/components/ui/media-badges'
import { LoadingCard } from '@/components/common/loading-spinner'
import { getTMDBTitle, getTMDBReleaseDate } from '@/lib/utils'
import { useSearch } from '@/hooks/use-search'
import { useMedia } from '@/hooks/use-media'
import { useMediaStore } from '@/stores/media-store'
import { api } from '@/trpc/react'
import type { TMDBMediaItem } from '@/types'

type SortOption = 'popularity' | 'vote_average' | 'release_date' | 'title'
type SortDirection = 'asc' | 'desc'

interface FilterState {
  mediaType: 'all' | 'movie' | 'tv'
  minRating: number[]
  year: string
  sortBy: SortOption
  sortDirection: SortDirection
}

const INITIAL_FILTERS: FilterState = {
  mediaType: 'all',
  minRating: [0],
  year: '',
  sortBy: 'popularity',
  sortDirection: 'desc',
}

export default function SearchPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(INITIAL_FILTERS)

  const {
    query,
    results,
    isLoading,
    error,
    searchType,
    setQuery,
    setSearchType,
    clearSearch,
  } = useSearch()

  const { addMedia } = useMedia()
  const { isItemInWatchlist } = useMediaStore()

  // Fetch user stats
  const { data: stats } = api.user.getStats.useQuery()

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    if (!results.length) return []

    const filtered = results.filter(item => {
      // Media type filter
      if (
        appliedFilters.mediaType !== 'all' &&
        item.media_type !== appliedFilters.mediaType
      ) {
        return false
      }

      // Rating filter
      if (item.vote_average < appliedFilters.minRating[0]) {
        return false
      }

      // Year filter
      if (appliedFilters.year) {
        const releaseDate = getTMDBReleaseDate(item)
        const releaseYear = releaseDate
          ? new Date(releaseDate).getFullYear().toString()
          : ''
        if (releaseYear !== appliedFilters.year) {
          return false
        }
      }

      return true
    })

    // Sort results
    return filtered.sort((a, b) => {
      let comparison = 0

      switch (appliedFilters.sortBy) {
        case 'popularity':
          // TMDB doesn't always provide popularity, so we use vote_count as proxy
          comparison = (b.vote_count || 0) - (a.vote_count || 0)
          break
        case 'vote_average':
          comparison = b.vote_average - a.vote_average
          break
        case 'release_date':
          const dateA = getTMDBReleaseDate(a)
          const dateB = getTMDBReleaseDate(b)
          comparison =
            dateA && dateB
              ? new Date(dateB).getTime() - new Date(dateA).getTime()
              : 0
          break
        case 'title':
          comparison = getTMDBTitle(a).localeCompare(getTMDBTitle(b))
          break
      }

      return appliedFilters.sortDirection === 'asc' ? -comparison : comparison
    })
  }, [results, appliedFilters])

  const handleAddMedia = async (media: TMDBMediaItem) => {
    await addMedia(media)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.mediaType !== 'all') count++
    if (appliedFilters.minRating[0] > 0) count++
    if (appliedFilters.year) count++
    return count
  }

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const updateAppliedSort = (sortBy: SortOption, direction?: SortDirection) => {
    const newDirection =
      direction ||
      (appliedFilters.sortBy === sortBy &&
      appliedFilters.sortDirection === 'desc'
        ? 'asc'
        : 'desc')
    setAppliedFilters(prev => ({
      ...prev,
      sortBy,
      sortDirection: newDirection,
    }))
  }

  return (
    <DashboardLayout stats={stats}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Search & Discover</h1>
              <p className="text-muted-foreground mt-1">
                Find new movies and TV shows to add to your watchlist
              </p>
            </div>
          </div>
        </div>

        {/* Search Interface */}
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
              onValueChange={value => setSearchType(value as 'movie' | 'tv')}
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
                  onChange={e => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
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
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Media Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Media Type</label>
                      <select
                        value={filters.mediaType}
                        onChange={e =>
                          updateFilter(
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
                          updateFilter('minRating', [
                            parseFloat(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Year Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Release Year
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 2024"
                        value={filters.year}
                        onChange={e => updateFilter('year', e.target.value)}
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
                          updateFilter('sortBy', e.target.value as SortOption)
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
                    <Button variant="outline" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {query && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Results for "{query}"
                  {filteredAndSortedResults.length > 0 && (
                    <Badge variant="outline">
                      {filteredAndSortedResults.length} results
                    </Badge>
                  )}
                </CardTitle>

                {filteredAndSortedResults.length > 0 && (
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
                        onClick={() => updateAppliedSort('popularity')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Popularity
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateAppliedSort('vote_average')}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rating
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateAppliedSort('release_date')}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Release Date
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateAppliedSort('title')}
                      >
                        <Film className="h-4 w-4 mr-2" />
                        Title
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Active Filters Display */}
              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {appliedFilters.mediaType !== 'all' && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {appliedFilters.mediaType === 'movie'
                        ? 'Movies'
                        : 'TV Shows'}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          updateFilter('mediaType', 'all')
                          applyFilters()
                        }}
                      />
                    </Badge>
                  )}
                  {appliedFilters.minRating[0] > 0 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Rating ≥ {appliedFilters.minRating[0]}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          updateFilter('minRating', [0])
                          applyFilters()
                        }}
                      />
                    </Badge>
                  )}
                  {appliedFilters.year && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Year: {appliedFilters.year}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          updateFilter('year', '')
                          applyFilters()
                        }}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Error searching: {error}
                  </p>
                </div>
              ) : filteredAndSortedResults.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredAndSortedResults.map(media => {
                    const isInWatchlist = isItemInWatchlist(
                      media.id,
                      media.media_type
                    )
                    return (
                      <Card
                        key={media.id}
                        className="transition-shadow hover:shadow-md p-0"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <MediaPoster
                              src={media.poster_path}
                              alt={getTMDBTitle(media)}
                              mediaType={media.media_type}
                              size="md"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-lg leading-tight">
                                    {getTMDBTitle(media)}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MediaTypeBadge
                                      mediaType={media.media_type}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {getTMDBReleaseDate(media)}
                                    </span>
                                    <VoteAverageBadge
                                      rating={media.vote_average}
                                    />
                                  </div>
                                </div>

                                <Button
                                  onClick={() =>
                                    !isInWatchlist && handleAddMedia(media)
                                  }
                                  size="sm"
                                  className="shrink-0"
                                  disabled={isInWatchlist}
                                  variant={
                                    isInWatchlist ? 'secondary' : 'default'
                                  }
                                >
                                  {isInWatchlist ? '✓ Added' : '+ Add'}
                                </Button>
                              </div>

                              {media.overview && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {media.overview}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No results found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!query && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
                <p className="text-muted-foreground mb-4">
                  Search for movies and TV shows to add to your watchlist
                </p>
                <p className="text-sm text-muted-foreground">
                  Use filters and sorting to find exactly what you're looking
                  for
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
