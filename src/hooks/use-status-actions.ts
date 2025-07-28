import { useState } from 'react'
import type { WatchStatus, WatchedItem } from '@/types'

interface UseStatusActionsOptions {
  onUpdate: (id: string, data: Partial<WatchedItem>) => Promise<void> | void
  onConfirmComplete?: () => void
  requiresConfirmation?: boolean
}

export function useStatusActions(
  item: WatchedItem,
  { onUpdate, onConfirmComplete, requiresConfirmation = false }: UseStatusActionsOptions
) {
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false)

  const handleStatusChange = (newStatus: WatchStatus) => {
    // Show confirmation dialog for TV shows when marking as complete
    if (newStatus === 'COMPLETED' && item.mediaType === 'TV' && requiresConfirmation) {
      setIsCompletionDialogOpen(true)
      return
    }

    const updates: Partial<WatchedItem> = {
      status: newStatus,
      // Preserve existing progress when changing status
      progress: item.progress,
    }

    // Add date updates based on status
    if (newStatus === 'COMPLETED') {
      updates.finishDate = new Date()
      if (item.mediaType === 'MOVIE') {
        updates.progress = 100
      }
    }

    if (newStatus === 'WATCHING' && !item.startDate) {
      updates.startDate = new Date()
    }

    onUpdate(item.id, updates)
  }

  const handleConfirmComplete = () => {
    const updates: Partial<WatchedItem> = {
      status: 'COMPLETED',
      progress: 100,
      finishDate: new Date(),
    }

    // For TV shows, mark all episodes as watched (handled by backend)
    if (item.mediaType === 'TV') {
      // Backend will handle episode completion
    }

    onUpdate(item.id, updates)
    setIsCompletionDialogOpen(false)
    onConfirmComplete?.()
  }

  const handleResetProgress = () => {
    const updates: Partial<WatchedItem> = {
      status: 'PLANNED',
      progress: 0,
      startDate: null,
      finishDate: null,
    }

    // Reset TV show specific fields
    if (item.mediaType === 'TV') {
      updates.currentSeason = 1
      updates.currentEpisode = 1
      updates.watchedEpisodes = []
    }

    // Reset movie specific fields
    if (item.mediaType === 'MOVIE') {
      updates.currentRuntime = null
    }

    onUpdate(item.id, updates)
  }

  return {
    handleStatusChange,
    handleConfirmComplete,
    handleResetProgress,
    isCompletionDialogOpen,
    setIsCompletionDialogOpen,
  }
}