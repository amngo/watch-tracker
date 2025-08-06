'use client'

import { useState, useCallback } from 'react'
import { Plus, Film, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WatchedItemCard } from '@/components/features/media/watched-item-card'
import { LibraryBulkActionsBar } from '@/components/features/library/library-bulk-actions-bar'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import type { WatchedItem } from '@/types'

export default function MoviesPage() {
  const {
    watchedItems,
    itemsLoading,
    updateItem,
    deleteItem,
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdateRating,
    bulkUpdateDates,
    isBulkUpdatingStatus,
    isBulkDeleting,
    isBulkUpdatingRating,
    isBulkUpdatingDates,
  } = useMedia()
  const { openSearchModal } = useUI()

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkMode, setShowBulkMode] = useState(false)

  // Filter items by media type
  const movieWatchlistItems = watchedItems.filter(
    item => item.mediaType === 'MOVIE'
  )

  // Selection handlers
  const handleSelectionChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev =>
      selected ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(movieWatchlistItems.map(item => item.id))
  }, [movieWatchlistItems])

  const handleSelectNone = useCallback(() => {
    setSelectedIds([])
  }, [])

  const toggleBulkMode = useCallback(() => {
    setShowBulkMode(prev => !prev)
    if (showBulkMode) {
      setSelectedIds([])
    }
  }, [showBulkMode])

  // Bulk action handlers
  const handleBulkUpdateStatus = useCallback(
    async (
      ids: string[],
      status: Parameters<typeof bulkUpdateStatus>[1],
      options?: Parameters<typeof bulkUpdateStatus>[2]
    ) => {
      await bulkUpdateStatus(ids, status, options)
      setSelectedIds([])
    },
    [bulkUpdateStatus]
  )

  const handleBulkDelete = useCallback(
    async (ids: string[]) => {
      await bulkDelete(ids)
      setSelectedIds([])
    },
    [bulkDelete]
  )

  const handleBulkUpdateRating = useCallback(
    async (ids: string[], rating: number | null) => {
      await bulkUpdateRating(ids, rating)
      setSelectedIds([])
    },
    [bulkUpdateRating]
  )

  const handleBulkUpdateDates = useCallback(
    async (ids: string[], options: Parameters<typeof bulkUpdateDates>[1]) => {
      await bulkUpdateDates(ids, options)
      setSelectedIds([])
    },
    [bulkUpdateDates]
  )

  const handleUpdateItem = async (id: string, data: Partial<WatchedItem>) => {
    await updateItem(id, data)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

  const isLoading =
    isBulkUpdatingStatus ||
    isBulkDeleting ||
    isBulkUpdatingRating ||
    isBulkUpdatingDates

  return (
    <div className="space-y-8">
      {/* Movie Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Movies"
          value={movieWatchlistItems.length}
          description="Movies in your collection"
          icon={Film}
          isLoading={itemsLoading}
        />
        <StatsCard
          title="Completed"
          value={
            movieWatchlistItems.filter(item => item.status === 'COMPLETED')
              .length
          }
          description="Movies watched"
          icon={Film}
          isLoading={itemsLoading}
        />
        <StatsCard
          title="Watching"
          value={
            movieWatchlistItems.filter(item => item.status === 'WATCHING')
              .length
          }
          description="Currently watching"
          icon={Film}
          isLoading={itemsLoading}
        />
        <StatsCard
          title="Planned"
          value={
            movieWatchlistItems.filter(item => item.status === 'PLANNED').length
          }
          description="Want to watch"
          icon={Film}
          isLoading={itemsLoading}
        />
      </div>

      {/* Movie Collection */}
      <div>
        <SectionHeader title="Your Movie Collection">
          <div className="flex items-center gap-2">
            {movieWatchlistItems.length > 0 && (
              <Button
                variant={showBulkMode ? 'default' : 'outline'}
                size="sm"
                onClick={toggleBulkMode}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {showBulkMode ? 'Exit Select' : 'Select'}
              </Button>
            )}
            <Button variant="outline" onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add More Movies
            </Button>
          </div>
        </SectionHeader>

        {itemsLoading ? (
          <LoadingGrid count={8} className="grid gap-4" />
        ) : movieWatchlistItems.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No movies yet"
            description="Start building your movie collection by adding your first film"
          >
            <Button onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Movie
            </Button>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            <LibraryBulkActionsBar
              selectedIds={selectedIds}
              totalItems={movieWatchlistItems.length}
              mediaType="MOVIE"
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
              onBulkUpdateRating={handleBulkUpdateRating}
              onBulkUpdateDates={handleBulkUpdateDates}
              isLoading={isLoading}
            />

            {/* Movie Grid */}
            <div className="grid gap-4">
              {movieWatchlistItems.map(item => (
                <WatchedItemCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  showSelection={showBulkMode}
                  isSelected={selectedIds.includes(item.id)}
                  onSelectionChange={handleSelectionChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
