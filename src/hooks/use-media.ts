import { useCallback } from 'react'
import { useMediaStore } from '@/stores/media-store'
import { api } from '@/trpc/react'
import { showToast } from '@/components/common/toast-provider'
import {
  calculateProgress,
  convertTMDBMediaType,
  getTMDBTitle,
  getTMDBReleaseDate,
} from '@/lib/utils'
import { logError } from '@/lib/logger'
import type { UpdateWatchedItemData, WatchedItem } from '@/types'
import { tmdb } from '@/lib/tmdb'
import { MovieWithMediaType, TVWithMediaType } from 'tmdb-ts'

export function useMedia() {
  const store = useMediaStore()
  const utils = api.useUtils()

  // tRPC mutations
  const createMutation = api.watchedItem.create.useMutation({
    onSuccess: data => {
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

      // Invalidate navigation counts to update badges and watchlist queries
      utils.stats.navigationCounts.invalidate()
      utils.watchedItem.getAll.invalidate()

      // Only invalidate releases queries for TV shows (they have upcoming episodes)
      if (data.mediaType === 'TV') {
        utils.releases.getUpcoming.invalidate()
        utils.releases.getByDateRange.invalidate()
      }

      showToast.success('Media added successfully!')
    },
    onError: error => {
      store.setItemsError(error.message)
      showToast.error('Failed to add media', error.message)
    },
  })

  const updateMutation = api.watchedItem.update.useMutation({
    onSuccess: data => {
      // Confirm the optimistic update
      store.confirmOptimisticUpdate(data.id)

      // Get current item to check if we should preserve progress
      const currentItem = store.getItemById(data.id)
      const shouldPreserveProgress =
        currentItem &&
        // If the current item has progress and current/total episodes/runtime haven't changed
        currentItem.progress !== undefined &&
        currentItem.currentEpisode === data.currentEpisode &&
        currentItem.currentRuntime === data.currentRuntime

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
        progress: shouldPreserveProgress
          ? currentItem.progress
          : calculateProgress(
              data.status,
              data.currentEpisode,
              data.totalEpisodes,
              data.currentRuntime,
              data.totalRuntime
            ),
      })

      // Invalidate watchlist queries to update releases page
      utils.watchedItem.getAll.invalidate()

      // Invalidate releases queries to update calendar and upcoming releases
      utils.releases.getUpcoming.invalidate()
      utils.releases.getByDateRange.invalidate()

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

      // Invalidate navigation counts to update badges and watchlist queries
      utils.stats.navigationCounts.invalidate()
      utils.watchedItem.getAll.invalidate()

      // Invalidate releases queries to update calendar and upcoming releases
      utils.releases.getUpcoming.invalidate()
      utils.releases.getByDateRange.invalidate()

      showToast.success('Item removed')
    },
    onError: (error, variables) => {
      // Rollback the optimistic update
      store.rollbackOptimisticUpdate(variables.id)
      store.setItemsError(error.message)
      showToast.error('Failed to remove item', error.message)
    },
  })

  const updateTVShowDetailsMutation =
    api.watchedItem.updateTVShowDetails.useMutation({
      onSuccess: data => {
        // Update the item in the store with the new season/episode data
        store.updateWatchedItem(data.id, {
          totalSeasons: data.totalSeasons,
          totalEpisodes: data.totalEpisodes,
          updatedAt: data.updatedAt,
        })

        // Invalidate releases queries since TV show details affect upcoming episodes
        utils.releases.getUpcoming.invalidate()
        utils.releases.getByDateRange.invalidate()

        showToast.success('TV show details updated!')
      },
      onError: error => {
        store.setItemsError(error.message)
        showToast.error('Failed to update TV show details', error.message)
      },
    })

  const updateAllTVShowDetailsMutation =
    api.watchedItem.updateAllTVShowDetails.useMutation({
      onSuccess: result => {
        // Refresh the watched items to get updated data
        store.setLastUpdated()

        // Invalidate releases queries since bulk TV show updates affect upcoming episodes
        utils.releases.getUpcoming.invalidate()
        utils.releases.getByDateRange.invalidate()

        let successMessage = `Updated ${result.successfulUpdates} TV shows`
        if (result.totalProcessed === 0) {
          successMessage = 'All TV shows are already up to date'
        }

        showToast.success(
          successMessage,
          result.failedUpdates > 0
            ? `${result.failedUpdates} updates failed`
            : undefined
        )

        // Show detailed errors if any
        if (result.errors && result.errors.length > 0) {
          console.warn('TV show update errors:', result.errors)
        }
      },
      onError: error => {
        store.setItemsError(error.message)
        showToast.error('Failed to update TV show details', error.message)
      },
    })

  // Bulk operations
  const bulkUpdateStatusMutation = api.watchedItem.bulkUpdateStatus.useMutation(
    {
      onSuccess: result => {
        // Invalidate watchlist queries to refresh data
        utils.watchedItem.getAll.invalidate()
        utils.stats.navigationCounts.invalidate()
        utils.releases.getUpcoming.invalidate()
        utils.releases.getByDateRange.invalidate()

        showToast.success(`Updated status for ${result.updatedCount} items`)
      },
      onError: error => {
        showToast.error('Failed to update status', error.message)
      },
    }
  )

  const bulkDeleteMutation = api.watchedItem.bulkDelete.useMutation({
    onSuccess: result => {
      // Invalidate watchlist queries to refresh data
      utils.watchedItem.getAll.invalidate()
      utils.stats.navigationCounts.invalidate()
      utils.releases.getUpcoming.invalidate()
      utils.releases.getByDateRange.invalidate()

      showToast.success(`Removed ${result.deletedCount} items from library`)
    },
    onError: error => {
      showToast.error('Failed to remove items', error.message)
    },
  })

  const bulkUpdateRatingMutation = api.watchedItem.bulkUpdateRating.useMutation(
    {
      onSuccess: result => {
        // Invalidate watchlist queries to refresh data
        utils.watchedItem.getAll.invalidate()

        showToast.success(`Updated rating for ${result.updatedCount} items`)
      },
      onError: error => {
        showToast.error('Failed to update ratings', error.message)
      },
    }
  )

  const bulkUpdateDatesMutation = api.watchedItem.bulkUpdateDates.useMutation({
    onSuccess: result => {
      // Invalidate watchlist queries to refresh data
      utils.watchedItem.getAll.invalidate()

      showToast.success(`Updated dates for ${result.updatedCount} items`)
    },
    onError: error => {
      showToast.error('Failed to update dates', error.message)
    },
  })

  const bulkUpdateTVShowDetailsMutation =
    api.watchedItem.bulkUpdateTVShowDetails.useMutation({
      onSuccess: result => {
        // Invalidate watchlist queries to refresh data
        utils.watchedItem.getAll.invalidate()
        utils.releases.getUpcoming.invalidate()
        utils.releases.getByDateRange.invalidate()

        let message = `Updated ${result.updatedCount} TV shows`
        if (result.failedCount > 0) {
          message += `, ${result.failedCount} failed`
        }

        showToast.success(message)

        if (result.errors && result.errors.length > 0) {
          console.warn('Bulk TV show update errors:', result.errors)
        }
      },
      onError: error => {
        showToast.error('Failed to update TV show details', error.message)
      },
    })

  const addMedia = useCallback(
    async (media: TVWithMediaType | MovieWithMediaType) => {
      // Generate a temporary ID for optimistic update (outside try block for scope)
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      try {
        const releaseDate = getTMDBReleaseDate(media)
        const parsedReleaseDate = releaseDate
          ? new Date(releaseDate)
          : undefined

        // For TV shows, fetch detailed information to get accurate episode/season counts
        let totalEpisodes = null
        let totalSeasons = null
        let totalRuntime = null

        if (media.media_type === 'tv') {
          try {
            const tvDetails = await tmdb.tvShows.details(media.id)
            totalEpisodes = tvDetails.number_of_episodes || null
            totalSeasons = tvDetails.number_of_seasons || null
            // Calculate total runtime from episode runtime and number of episodes
            if (
              tvDetails.episode_run_time &&
              tvDetails.episode_run_time.length > 0 &&
              totalEpisodes
            ) {
              const avgEpisodeRuntime =
                tvDetails.episode_run_time.reduce((a, b) => a + b, 0) /
                tvDetails.episode_run_time.length
              totalRuntime = Math.round(avgEpisodeRuntime * totalEpisodes)
            }
          } catch (error) {
            // Log the error but continue with fallback values
            logError('Failed to fetch TV show details', error, {
              component: 'useMedia',
              metadata: { tmdbId: media.id },
            })
            // Use fallback values
            totalEpisodes = 24
            totalSeasons = 2
          }
        } else if (media.media_type === 'movie') {
          totalRuntime = 120 // Default movie runtime
        }

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
          totalEpisodes,
          currentSeason: null,
          totalSeasons,
          currentRuntime: null,
          totalRuntime,
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
          totalRuntime: totalRuntime || undefined,
          totalEpisodes: totalEpisodes || undefined,
          totalSeasons: totalSeasons || undefined,
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
          metadata: { tmdbId: media.id, mediaType: media.media_type },
        })
      }
    },
    [createMutation, store]
  )

  const updateItem = useCallback(
    async (id: string, data: UpdateWatchedItemData) => {
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
          metadata: { itemId: id },
        })
      }
    },
    [updateMutation, store]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        // Apply optimistic update
        store.optimisticRemoveItem(id)

        // Make the actual request
        await deleteMutation.mutateAsync({ id })
      } catch (error) {
        logError('Failed to delete watched item', error, {
          component: 'useMedia',
          metadata: { itemId: id },
        })
      }
    },
    [deleteMutation, store]
  )

  const markCompleted = useCallback(
    (id: string) => {
      // Optimistic update handles both local state and backend sync
      updateItem(id, {
        status: 'COMPLETED',
        finishDate: new Date(),
        progress: 100,
      })
    },
    [updateItem]
  )

  const markWatching = useCallback(
    (id: string) => {
      // Optimistic update handles both local state and backend sync
      updateItem(id, {
        status: 'WATCHING',
        startDate: new Date(),
      })
    },
    [updateItem]
  )

  const updateProgress = useCallback(
    (id: string, progress: number) => {
      // Optimistic update handles both local state and backend sync
      updateItem(id, { progress })
    },
    [updateItem]
  )

  const updateTVShowDetails = useCallback(
    async (id: string) => {
      try {
        await updateTVShowDetailsMutation.mutateAsync({ id })
      } catch (error) {
        logError('Failed to update TV show details', error, {
          component: 'useMedia',
          metadata: { itemId: id },
        })
      }
    },
    [updateTVShowDetailsMutation]
  )

  const updateAllTVShowDetails = useCallback(
    async (options?: { forceUpdate?: boolean; onlyMissingData?: boolean }) => {
      try {
        return await updateAllTVShowDetailsMutation.mutateAsync({
          forceUpdate: options?.forceUpdate ?? false,
          onlyMissingData: options?.onlyMissingData ?? true,
        })
      } catch (error) {
        logError('Failed to update all TV show details', error, {
          component: 'useMedia',
        })
      }
    },
    [updateAllTVShowDetailsMutation]
  )

  // Bulk operations handlers
  const bulkUpdateStatus = useCallback(
    async (
      ids: string[],
      status: 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'PAUSED' | 'DROPPED',
      options?: { startDate?: Date | null; finishDate?: Date | null }
    ) => {
      try {
        await bulkUpdateStatusMutation.mutateAsync({
          ids,
          status,
          startDate: options?.startDate,
          finishDate: options?.finishDate,
        })
      } catch (error) {
        logError('Failed to bulk update status', error, {
          component: 'useMedia',
          metadata: { ids, status },
        })
      }
    },
    [bulkUpdateStatusMutation]
  )

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      try {
        await bulkDeleteMutation.mutateAsync({ ids })
      } catch (error) {
        logError('Failed to bulk delete items', error, {
          component: 'useMedia',
          metadata: { ids },
        })
      }
    },
    [bulkDeleteMutation]
  )

  const bulkUpdateRating = useCallback(
    async (ids: string[], rating: number | null) => {
      try {
        await bulkUpdateRatingMutation.mutateAsync({ ids, rating })
      } catch (error) {
        logError('Failed to bulk update ratings', error, {
          component: 'useMedia',
          metadata: { ids, rating },
        })
      }
    },
    [bulkUpdateRatingMutation]
  )

  const bulkUpdateDates = useCallback(
    async (
      ids: string[],
      options: { startDate?: Date | null; finishDate?: Date | null }
    ) => {
      try {
        await bulkUpdateDatesMutation.mutateAsync({ ids, ...options })
      } catch (error) {
        logError('Failed to bulk update dates', error, {
          component: 'useMedia',
          metadata: { ids },
        })
      }
    },
    [bulkUpdateDatesMutation]
  )

  const bulkUpdateTVShowDetails = useCallback(
    async (ids: string[]) => {
      try {
        await bulkUpdateTVShowDetailsMutation.mutateAsync({ ids })
      } catch (error) {
        logError('Failed to bulk update TV show details', error, {
          component: 'useMedia',
          metadata: { ids },
        })
      }
    },
    [bulkUpdateTVShowDetailsMutation]
  )

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

    // Bulk operation loading states
    isBulkUpdatingStatus: bulkUpdateStatusMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkUpdatingRating: bulkUpdateRatingMutation.isPending,
    isBulkUpdatingDates: bulkUpdateDatesMutation.isPending,
    isBulkUpdatingTVShowDetails: bulkUpdateTVShowDetailsMutation.isPending,
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
    updateTVShowDetails,
    updateAllTVShowDetails,

    // Bulk actions
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdateRating,
    bulkUpdateDates,
    bulkUpdateTVShowDetails,

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
