'use client'

import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SearchHeader } from '@/components/features/search/search-header'
import { SearchInterface } from '@/components/features/search/search-interface'
import { SearchResults } from '@/components/features/search/search-results'
import { EmptySearchState } from '@/components/features/search/empty-search-state'
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
        <SearchHeader />
        
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
          results={filteredAndSortedResults}
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
