import { useCallback } from 'react'
import { useMediaStore } from '@/stores/media-store'
import { api } from '@/trpc/react'
import { showToast } from '@/components/common/toast-provider'
import { calculateProgress } from '@/lib/utils'
import { logError } from '@/lib/logger'
import type { TMDBSearchResultItem, UpdateWatchedItemData } from '@/types'

export function useMedia() {
  const store = useMediaStore()
  
  // tRPC mutations
  const createMutation = api.watchedItem.create.useMutation({
    onMutate: () => {
      store.setItemsLoading(true)
    },
    onSuccess: (data) => {
      store.addWatchedItem({
        id: data.id,
        tmdbId: data.tmdbId,
        mediaType: data.mediaType,
        title: data.title,
        poster: data.poster,
        releaseDate: data.releaseDate,
        status: data.status,
        rating: data.rating,
        currentEpisode: data.currentEpisode,
        totalEpisodes: data.totalEpisodes,
        currentSeason: data.currentSeason,
        totalSeasons: data.totalSeasons,
        currentRuntime: data.currentRuntime,
        totalRuntime: data.totalRuntime,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        startDate: data.startDate,
        finishDate: data.finishDate,
        notes: [],
        _count: { notes: 0 },
        progress: calculateProgress(
          data.status,
          data.currentEpisode,
          data.totalEpisodes,
          data.currentRuntime,
          data.totalRuntime
        ),
      })
      store.setItemsLoading(false)
      showToast.success('Media added successfully!')
    },
    onError: (error) => {
      store.setItemsLoading(false)
      store.setItemsError(error.message)
      showToast.error('Failed to add media', error.message)
    },
  })

  const updateMutation = api.watchedItem.update.useMutation({
    onMutate: () => {
      store.setItemsLoading(true)
    },
    onSuccess: (data) => {
      store.updateWatchedItem(data.id, {
        status: data.status,
        rating: data.rating,
        currentEpisode: data.currentEpisode,
        currentSeason: data.currentSeason,
        currentRuntime: data.currentRuntime,
        startDate: data.startDate,
        finishDate: data.finishDate,
        updatedAt: data.updatedAt,
        progress: calculateProgress(
          data.status,
          data.currentEpisode,
          data.totalEpisodes,
          data.currentRuntime,
          data.totalRuntime
        ),
      })
      store.setItemsLoading(false)
      showToast.success('Progress updated!')
    },
    onError: (error) => {
      store.setItemsLoading(false)
      store.setItemsError(error.message)
      showToast.error('Failed to update progress', error.message)
    },
  })

  const deleteMutation = api.watchedItem.delete.useMutation({
    onMutate: () => {
      store.setItemsLoading(true)
    },
    onSuccess: (_, variables) => {
      store.removeWatchedItem(variables.id)
      store.setItemsLoading(false)
      showToast.success('Item removed')
    },
    onError: (error) => {
      store.setItemsLoading(false)
      store.setItemsError(error.message)
      showToast.error('Failed to remove item', error.message)
    },
  })

  const addMedia = useCallback(async (media: TMDBSearchResultItem) => {
    try {
      const dateString = media.release_date || media.first_air_date
      const releaseDate = dateString ? new Date(dateString) : undefined

      await createMutation.mutateAsync({
        tmdbId: media.id,
        mediaType: media.media_type === 'movie' ? 'MOVIE' : 'TV',
        title: media.title || media.name || 'Unknown Title',
        poster: media.poster_path || undefined,
        releaseDate,
        totalRuntime: media.media_type === 'movie' ? 120 : undefined,
        totalEpisodes: media.media_type === 'tv' ? 24 : undefined,
        totalSeasons: media.media_type === 'tv' ? 2 : undefined,
      })
    } catch (error) {
      logError('Failed to add media to watchlist', error, {
        component: 'useMedia',
        metadata: { tmdbId: media.id, mediaType: media.media_type }
      })
    }
  }, [createMutation])

  const updateItem = useCallback(async (
    id: string,
    data: UpdateWatchedItemData
  ) => {
    try {
      await updateMutation.mutateAsync({ id, ...data })
    } catch (error) {
      logError('Failed to update watched item', error, {
        component: 'useMedia',
        metadata: { itemId: id }
      })
    }
  }, [updateMutation])

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id })
    } catch (error) {
      logError('Failed to delete watched item', error, {
        component: 'useMedia',
        metadata: { itemId: id }
      })
    }
  }, [deleteMutation])

  const markCompleted = useCallback((id: string) => {
    store.markAsCompleted(id)
    // Sync with backend
    updateItem(id, { status: 'COMPLETED', finishDate: new Date() })
  }, [updateItem]) // Removed 'store' - Zustand store functions are stable

  const markWatching = useCallback((id: string) => {
    store.markAsWatching(id)
    // Sync with backend
    updateItem(id, { status: 'WATCHING', startDate: new Date() })
  }, [updateItem]) // Removed 'store' - Zustand store functions are stable

  const updateProgress = useCallback((id: string, progress: number) => {
    store.updateProgress(id, progress)
    // Sync with backend
    updateItem(id, { progress })
  }, [updateItem]) // Removed 'store' - Zustand store functions are stable

  return {
    // State
    watchedItems: store.watchedItems,
    stats: store.stats,
    searchResults: store.searchResults,
    itemsLoading: store.itemsLoading,
    statsLoading: store.statsLoading,
    searchLoading: store.searchLoading,
    itemsError: store.itemsError,
    statsError: store.statsError,
    searchError: store.searchError,
    lastUpdated: store.lastUpdated,
    hasNextPage: store.hasNextPage,
    currentPage: store.currentPage,

    // Actions
    addMedia,
    updateItem,
    deleteItem,
    markCompleted,
    markWatching,
    updateProgress,

    // Store actions (direct access)
    setWatchedItems: store.setWatchedItems,
    setStats: store.setStats,
    setSearchResults: store.setSearchResults,
    clearSearchResults: store.clearSearchResults,
    setItemsLoading: store.setItemsLoading,
    setStatsLoading: store.setStatsLoading,
    setSearchLoading: store.setSearchLoading,
    resetErrors: store.resetErrors,

    // Utilities
    getItemById: store.getItemById,
    getItemsByStatus: store.getItemsByStatus,
    getItemsByType: store.getItemsByType,
  }
}