import { useCallback, useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useMediaStore } from '@/stores/media-store'
import { api } from '@/trpc/react'
import { useDebounce } from './use-debounce'

export function useSearch() {
  const ui = useUIStore()
  const media = useMediaStore()

  const debouncedQuery = useDebounce(ui.searchQuery, 300)

  // Search API call
  const { data, isLoading, error } = api.search.search.useQuery(
    { query: debouncedQuery, type: ui.searchType, page: 1 },
    {
      enabled: !!debouncedQuery && debouncedQuery.length > 0,
    }
  )

  // Update store when search results change
  useEffect(() => {
    if (data?.results) {
      media.setSearchResults(data.results as any)
    }
  }, [data])

  // Update loading state
  useEffect(() => {
    ui.setSearchLoading(isLoading)
  }, [isLoading])

  // Update error state
  useEffect(() => {
    if (error) {
      media.setSearchError(error.message)
    } else {
      media.setSearchError(null)
    }
  }, [error])

  const setQuery = useCallback((query: string) => {
    ui.setSearchQuery(query)
    if (!query) {
      media.clearSearchResults()
      media.setSearchError(null)
    }
  }, [])

  const clearSearch = useCallback(() => {
    ui.clearSearch()
    media.clearSearchResults()
    media.setSearchError(null)
  }, [])

  const setSearchType = useCallback((type: 'movie' | 'tv') => {
    ui.setSearchType(type)
    // Clear results when switching search type to trigger new search
    if (debouncedQuery) {
      media.clearSearchResults()
    }
  }, [debouncedQuery])

  const openSearchModal = useCallback(() => {
    ui.openSearchModal()
  }, [])

  const closeSearchModal = useCallback(() => {
    ui.closeSearchModal()
    // Optionally clear search when closing modal
    clearSearch()
  }, [])

  return {
    // State
    query: ui.searchQuery,
    results: media.searchResults,
    isLoading: ui.searchLoading,
    error: media.searchError,
    isModalOpen: ui.isSearchModalOpen,
    searchType: ui.searchType,

    // Actions
    setQuery,
    clearSearch,
    setSearchType,
    openSearchModal,
    closeSearchModal,

    // Raw data for advanced usage
    rawData: data,
  }
}
