import { useCallback } from 'react'
import { useMediaStore } from '@/stores/media-store'
import { api } from '@/trpc/react'
import { showToast } from '@/components/common/toast-provider'
import { calculateProgress, convertTMDBMediaType, getTMDBTitle, getTMDBReleaseDate } from '@/lib/utils'
import { logError } from '@/lib/logger'
import type { TMDBMediaItem, UpdateWatchedItemData, WatchedItem } from '@/types'

export function useMedia() {
  const store = useMediaStore()
  
  // tRPC mutations
  const createMutation = api.watchedItem.create.useMutation({
    onSuccess: (data) => {
      // Confirm the optimistic update
      store.confirmOptimisticUpdate(data.id)
      
      // Update with actual server data
      store.updateWatchedItem(data.id, {
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
        progress: calculateProgress(
          data.status,
          data.currentEpisode,
          data.totalEpisodes,
          data.currentRuntime,
          data.totalRuntime
        ),
      })
      
      showToast.success('Media added successfully!')
    },
    onError: (error) => {
      store.setItemsError(error.message)
      showToast.error('Failed to add media', error.message)
    },
  })

  const updateMutation = api.watchedItem.update.useMutation({
    onSuccess: (data) => {
      // Confirm the optimistic update
      store.confirmOptimisticUpdate(data.id)
      
      // Update with actual server data
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
      
      showToast.success('Progress updated!')
    },
    onError: (error, variables) => {
      // Rollback the optimistic update
      store.rollbackOptimisticUpdate(variables.id)
      store.setItemsError(error.message)
      showToast.error('Failed to update progress', error.message)
    },
  })

  const deleteMutation = api.watchedItem.delete.useMutation({
    onSuccess: (_, variables) => {
      // Confirm the optimistic update
      store.confirmOptimisticUpdate(variables.id)
      showToast.success('Item removed')
    },
    onError: (error, variables) => {
      // Rollback the optimistic update
      store.rollbackOptimisticUpdate(variables.id)
      store.setItemsError(error.message)
      showToast.error('Failed to remove item', error.message)
    },
  })

  const addMedia = useCallback(async (media: TMDBMediaItem) => {
    // Generate a temporary ID for optimistic update (outside try block for scope)
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const releaseDate = getTMDBReleaseDate(media)
      const parsedReleaseDate = releaseDate ? new Date(releaseDate) : undefined
      
      // Create optimistic item
      const optimisticItem: WatchedItem = {
        id: tempId,
        tmdbId: media.id,
        mediaType: convertTMDBMediaType(media.media_type),
        title: getTMDBTitle(media),
        poster: media.poster_path || null,
        releaseDate: parsedReleaseDate || null,
        status: 'PLANNED',
        rating: null,
        currentEpisode: null,
        totalEpisodes: media.media_type === 'tv' ? 24 : null,
        currentSeason: null,
        totalSeasons: media.media_type === 'tv' ? 2 : null,
        currentRuntime: null,
        totalRuntime: media.media_type === 'movie' ? 120 : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        startDate: null,
        finishDate: null,
        notes: [],
        _count: { notes: 0 },
        progress: 0,
      }

      // Apply optimistic update
      store.optimisticAddItem(optimisticItem)

      // Make the actual request
      const result = await createMutation.mutateAsync({
        tmdbId: media.id,
        mediaType: convertTMDBMediaType(media.media_type),
        title: getTMDBTitle(media),
        poster: media.poster_path || undefined,
        releaseDate: parsedReleaseDate,
        totalRuntime: media.media_type === 'movie' ? 120 : undefined,
        totalEpisodes: media.media_type === 'tv' ? 24 : undefined,
        totalSeasons: media.media_type === 'tv' ? 2 : undefined,
      })

      // Replace the optimistic item with the real item
      store.confirmOptimisticUpdate(tempId)
      store.removeWatchedItem(tempId) // Remove the temp item
      store.addWatchedItem({
        id: result.id,
        tmdbId: result.tmdbId,
        mediaType: result.mediaType,
        title: result.title,
        poster: result.poster,
        releaseDate: result.releaseDate,
        status: result.status,
        rating: result.rating,
        currentEpisode: result.currentEpisode,
        totalEpisodes: result.totalEpisodes,
        currentSeason: result.currentSeason,
        totalSeasons: result.totalSeasons,
        currentRuntime: result.currentRuntime,
        totalRuntime: result.totalRuntime,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        startDate: result.startDate,
        finishDate: result.finishDate,
        notes: [],
        _count: { notes: 0 },
        progress: calculateProgress(
          result.status,
          result.currentEpisode,
          result.totalEpisodes,
          result.currentRuntime,
          result.totalRuntime
        ),
      })
    } catch (error) {
      // Rollback the optimistic update
      store.rollbackOptimisticUpdate(tempId)
      
      logError('Failed to add media to watchlist', error, {
        component: 'useMedia',
        metadata: { tmdbId: media.id, mediaType: media.media_type }
      })
    }
  }, [createMutation, store])

  const updateItem = useCallback(async (
    id: string,
    data: UpdateWatchedItemData
  ) => {
    try {
      // Apply optimistic update
      store.optimisticUpdateItem(id, {
        ...data,
        updatedAt: new Date(),
      })

      // Make the actual request
      await updateMutation.mutateAsync({ id, ...data })
    } catch (error) {
      logError('Failed to update watched item', error, {
        component: 'useMedia',
        metadata: { itemId: id }
      })
    }
  }, [updateMutation, store])

  const deleteItem = useCallback(async (id: string) => {
    try {
      // Apply optimistic update
      store.optimisticRemoveItem(id)

      // Make the actual request
      await deleteMutation.mutateAsync({ id })
    } catch (error) {
      logError('Failed to delete watched item', error, {
        component: 'useMedia',
        metadata: { itemId: id }
      })
    }
  }, [deleteMutation, store])

  const markCompleted = useCallback((id: string) => {
    // Optimistic update handles both local state and backend sync
    updateItem(id, { 
      status: 'COMPLETED', 
      finishDate: new Date(),
      progress: 100 
    })
  }, [updateItem])

  const markWatching = useCallback((id: string) => {
    // Optimistic update handles both local state and backend sync
    updateItem(id, { 
      status: 'WATCHING', 
      startDate: new Date() 
    })
  }, [updateItem])

  const updateProgress = useCallback((id: string, progress: number) => {
    // Optimistic update handles both local state and backend sync
    updateItem(id, { progress })
  }, [updateItem])

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

    // Optimistic update actions
    optimisticUpdateItem: store.optimisticUpdateItem,
    optimisticAddItem: store.optimisticAddItem,
    optimisticRemoveItem: store.optimisticRemoveItem,
    confirmOptimisticUpdate: store.confirmOptimisticUpdate,
    rollbackOptimisticUpdate: store.rollbackOptimisticUpdate,
    clearOptimisticUpdates: store.clearOptimisticUpdates,

    // Utilities
    getItemById: store.getItemById,
    getItemsByStatus: store.getItemsByStatus,
    getItemsByType: store.getItemsByType,
  }
}