'use client'

import { useCallback } from 'react'
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import type { CreateQueueItemData, QueueItem } from '@/types'

export function useQueue() {
  const utils = api.useUtils()

  // Queries
  const {
    data: queueItems = [] as QueueItem[],
    isLoading: isLoadingQueue,
    error: queueError,
  } = api.queue.getQueue.useQuery()

  const {
    data: watchHistory = [] as QueueItem[],
    isLoading: isLoadingHistory,
    error: historyError,
  } = api.queue.getWatchHistory.useQuery()

  // Mutations
  const addToQueueMutation = api.queue.addToQueue.useMutation({
    onSuccess: () => {
      toast.success('Added to queue')
      utils.queue.getQueue.invalidate()
      utils.stats.navigationCounts.invalidate()
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('Item already in queue')
      } else {
        toast.error('Failed to add to queue')
      }
    },
  })

  const removeFromQueueMutation = api.queue.removeFromQueue.useMutation({
    onSuccess: () => {
      toast.success('Removed from queue')
      utils.queue.getQueue.invalidate()
      utils.stats.navigationCounts.invalidate()
    },
    onError: () => {
      toast.error('Failed to remove from queue')
    },
  })

  const reorderQueueMutation = api.queue.reorderQueue.useMutation({
    onMutate: async ({ itemId, newPosition }) => {
      // Cancel outgoing refetches
      await utils.queue.getQueue.cancel()

      // Snapshot previous value
      const previousQueue = utils.queue.getQueue.getData()

      // Optimistically update
      if (previousQueue) {
        const items = [...previousQueue]
        const itemIndex = items.findIndex((item) => item.id === itemId)
        
        if (itemIndex !== -1) {
          const [movedItem] = items.splice(itemIndex, 1)
          items.splice(newPosition - 1, 0, movedItem)
          
          // Update positions
          const updatedItems = items.map((item, index) => ({
            ...item,
            position: index + 1,
          }))
          
          utils.queue.getQueue.setData(undefined, updatedItems)
        }
      }

      return { previousQueue }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousQueue) {
        utils.queue.getQueue.setData(undefined, context.previousQueue)
      }
      toast.error('Failed to reorder queue')
    },
    onSettled: () => {
      utils.queue.getQueue.invalidate()
    },
  })

  const markAsWatchedMutation = api.queue.markAsWatched.useMutation({
    onSuccess: () => {
      toast.success('Marked as watched')
      utils.queue.getQueue.invalidate()
      utils.queue.getWatchHistory.invalidate()
      utils.stats.navigationCounts.invalidate()
      // Invalidate watched items to reflect progress updates
      utils.watchedItem.getAll.invalidate()
    },
    onError: () => {
      toast.error('Failed to mark as watched')
    },
  })

  const clearWatchedMutation = api.queue.clearWatchedItems.useMutation({
    onSuccess: (result) => {
      toast.success(`Cleared ${result.deletedCount} watched items`)
      utils.queue.getQueue.invalidate()
      utils.queue.getWatchHistory.invalidate()
      utils.stats.navigationCounts.invalidate()
    },
    onError: () => {
      toast.error('Failed to clear watched items')
    },
  })

  const clearQueueMutation = api.queue.clearQueue.useMutation({
    onSuccess: (result) => {
      toast.success(`Cleared ${result.deletedCount} items from queue`)
      utils.queue.getQueue.invalidate()
      utils.stats.navigationCounts.invalidate()
    },
    onError: () => {
      toast.error('Failed to clear queue')
    },
  })

  const addNextEpisodeMutation = api.queue.addNextEpisode.useMutation({
    onSuccess: () => {
      toast.success('Next episode added to queue')
      utils.queue.getQueue.invalidate()
      utils.stats.navigationCounts.invalidate()
    },
    onError: (error) => {
      if (error.data?.code === 'CONFLICT') {
        toast.error('Next episode already in queue')
      } else {
        toast.error('Failed to add next episode')
      }
    },
  })

  // Bulk operations
  const bulkMarkAsWatchedMutation = api.queue.bulkMarkAsWatched.useMutation({
    onSuccess: (result) => {
      toast.success(`Marked ${result.updatedCount} items as watched`)
      utils.queue.getQueue.invalidate()
      utils.queue.getWatchHistory.invalidate()
      utils.stats.navigationCounts.invalidate()
      // Invalidate watched items to reflect progress updates
      utils.watchedItem.getAll.invalidate()
    },
    onError: () => {
      toast.error('Failed to mark items as watched')
    },
  })

  const bulkRemoveFromQueueMutation = api.queue.bulkRemoveFromQueue.useMutation({
    onSuccess: (result) => {
      toast.success(`Removed ${result.deletedCount} items from queue`)
      utils.queue.getQueue.invalidate()
      utils.stats.navigationCounts.invalidate()
    },
    onError: () => {
      toast.error('Failed to remove items from queue')
    },
  })

  const bulkMoveToTopMutation = api.queue.bulkMoveToTop.useMutation({
    onSuccess: (result) => {
      toast.success(`Moved ${result.updatedCount} items to top`)
      utils.queue.getQueue.invalidate()
    },
    onError: () => {
      toast.error('Failed to move items to top')
    },
  })

  const bulkMoveToBottomMutation = api.queue.bulkMoveToBottom.useMutation({
    onSuccess: (result) => {
      toast.success(`Moved ${result.updatedCount} items to bottom`)
      utils.queue.getQueue.invalidate()
    },
    onError: () => {
      toast.error('Failed to move items to bottom')
    },
  })

  // Handlers
  const addToQueue = useCallback(
    (data: CreateQueueItemData) => {
      addToQueueMutation.mutate(data)
    },
    [addToQueueMutation]
  )

  const removeFromQueue = useCallback(
    (id: string) => {
      removeFromQueueMutation.mutate({ id })
    },
    [removeFromQueueMutation]
  )

  const reorderQueue = useCallback(
    (itemId: string, newPosition: number) => {
      reorderQueueMutation.mutate({ itemId, newPosition })
    },
    [reorderQueueMutation]
  )

  const markAsWatched = useCallback(
    (id: string) => {
      markAsWatchedMutation.mutate({ id })
    },
    [markAsWatchedMutation]
  )

  const clearWatchedItems = useCallback(() => {
    clearWatchedMutation.mutate()
  }, [clearWatchedMutation])

  const clearQueue = useCallback(() => {
    clearQueueMutation.mutate()
  }, [clearQueueMutation])

  const addNextEpisode = useCallback(
    (data: {
      contentId: string
      title: string
      poster?: string | null
      tmdbId: number
      currentSeason: number
      currentEpisode: number
      totalSeasons?: number | null
      totalEpisodes?: number | null
    }) => {
      addNextEpisodeMutation.mutate(data)
    },
    [addNextEpisodeMutation]
  )

  // Bulk handlers
  const bulkMarkAsWatched = useCallback(
    (ids: string[]) => {
      bulkMarkAsWatchedMutation.mutate({ ids })
    },
    [bulkMarkAsWatchedMutation]
  )

  const bulkRemoveFromQueue = useCallback(
    (ids: string[]) => {
      bulkRemoveFromQueueMutation.mutate({ ids })
    },
    [bulkRemoveFromQueueMutation]
  )

  const bulkMoveToTop = useCallback(
    (ids: string[]) => {
      bulkMoveToTopMutation.mutate({ ids })
    },
    [bulkMoveToTopMutation]
  )

  const bulkMoveToBottom = useCallback(
    (ids: string[]) => {
      bulkMoveToBottomMutation.mutate({ ids })
    },
    [bulkMoveToBottomMutation]
  )

  // Check if item is in queue
  const isInQueue = useCallback(
    (contentId: string, seasonNumber?: number, episodeNumber?: number) => {
      return queueItems.some(
        (item: QueueItem) =>
          item.contentId === contentId &&
          item.seasonNumber === seasonNumber &&
          item.episodeNumber === episodeNumber
      )
    },
    [queueItems]
  )

  // Get queue position for an item
  const getQueuePosition = useCallback(
    (contentId: string, seasonNumber?: number, episodeNumber?: number) => {
      const item = queueItems.find(
        (item: QueueItem) =>
          item.contentId === contentId &&
          item.seasonNumber === seasonNumber &&
          item.episodeNumber === episodeNumber
      )
      return item?.position || null
    },
    [queueItems]
  )

  return {
    // Data
    queueItems,
    watchHistory,
    
    // Loading states
    isLoading: isLoadingQueue || isLoadingHistory,
    isLoadingQueue,
    isLoadingHistory,
    isReordering: reorderQueueMutation.isPending,
    
    // Error states
    error: queueError || historyError,
    
    // Actions
    addToQueue,
    removeFromQueue,
    reorderQueue,
    markAsWatched,
    clearWatchedItems,
    clearQueue,
    addNextEpisode,
    
    // Bulk actions
    bulkMarkAsWatched,
    bulkRemoveFromQueue,
    bulkMoveToTop,
    bulkMoveToBottom,
    
    // Utilities
    isInQueue,
    getQueuePosition,
    
    // Mutation states
    isAddingToQueue: addToQueueMutation.isPending,
    isRemovingFromQueue: removeFromQueueMutation.isPending,
    isMarkingWatched: markAsWatchedMutation.isPending,
    isClearingWatched: clearWatchedMutation.isPending,
    isClearingQueue: clearQueueMutation.isPending,
    isAddingNextEpisode: addNextEpisodeMutation.isPending,
    
    // Bulk mutation states
    isBulkMarkingWatched: bulkMarkAsWatchedMutation.isPending,
    isBulkRemoving: bulkRemoveFromQueueMutation.isPending,
    isBulkMovingToTop: bulkMoveToTopMutation.isPending,
    isBulkMovingToBottom: bulkMoveToBottomMutation.isPending,
  }
}