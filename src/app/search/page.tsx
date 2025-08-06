'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader } from '@/components/common/page-header'
import { SearchInterface } from '@/components/features/search/search-interface'
import { SearchResults } from '@/components/features/search/search-results'
import { EmptySearchState } from '@/components/features/search/empty-search-state'
import { useSearch } from '@/hooks/use-search'
import { useMedia } from '@/hooks/use-media'
import { useMediaStore } from '@/stores/media-store'
import { api } from '@/trpc/react'
import { MovieWithMediaType, TVWithMediaType } from 'tmdb-ts'

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
  } = useSearch()

  const { addMedia } = useMedia()
  const { isItemInWatchlist } = useMediaStore()

  // Fetch user stats
  const { data: stats } = api.user.getStats.useQuery()

  const handleAddMedia = async (
    media: TVWithMediaType | MovieWithMediaType
  ) => {
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
        <PageHeader
          icon={Search}
          title="Search & Discover"
          subtitle="Find new movies and TV shows to add to your watchlist"
        />
        <SearchInterface
          searchType={searchType}
          onSetSearchType={setSearchType}
          query={query}
          onSetQuery={setQuery}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          filters={filters}
          onUpdateFilter={updateFilter}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          getActiveFilterCount={getActiveFilterCount}
        />

        <SearchResults
          query={query}
          results={results}
          mediaType={searchType}
          isLoading={isLoading}
          error={error}
          appliedFilters={appliedFilters}
          onUpdateFilter={updateFilter}
          onApplyFilters={applyFilters}
          getActiveFilterCount={getActiveFilterCount}
          onUpdateAppliedSort={updateAppliedSort}
          onAddMedia={handleAddMedia}
          isItemInWatchlist={isItemInWatchlist}
        />

        {!query && <EmptySearchState />}
      </div>
    </DashboardLayout>
  )
}
