'use client'

import { useState, useCallback } from 'react'
import { Plus, Tv, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TVShowCard } from '@/components/features/tv/tv-show-card'
import { LibraryBulkActionsBar } from '@/components/features/library/library-bulk-actions-bar'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import type { WatchedItem } from '@/types'

export default function TVShowsPage() {
  const { 
    watchedItems, 
    itemsLoading, 
    updateItem, 
    deleteItem,
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdateRating,
    bulkUpdateDates,
    bulkUpdateTVShowDetails,
    isBulkUpdatingStatus,
    isBulkDeleting,
    isBulkUpdatingRating,
    isBulkUpdatingDates,
    isBulkUpdatingTVShowDetails,
  } = useMedia()
  const { openSearchModal } = useUI()

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkMode, setShowBulkMode] = useState(false)

  // Filter items by media type
  const tvWatchlistItems = watchedItems.filter(item => item.mediaType === 'TV')

  // Selection handlers
  const handleSelectionChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(tvWatchlistItems.map(item => item.id))
  }, [tvWatchlistItems])

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
  const handleBulkUpdateStatus = useCallback(async (
    ids: string[], 
    status: Parameters<typeof bulkUpdateStatus>[1],
    options?: Parameters<typeof bulkUpdateStatus>[2]
  ) => {
    await bulkUpdateStatus(ids, status, options)
    setSelectedIds([])
  }, [bulkUpdateStatus])

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await bulkDelete(ids)
    setSelectedIds([])
  }, [bulkDelete])

  const handleBulkUpdateRating = useCallback(async (ids: string[], rating: number | null) => {
    await bulkUpdateRating(ids, rating)
    setSelectedIds([])
  }, [bulkUpdateRating])

  const handleBulkUpdateDates = useCallback(async (
    ids: string[], 
    options: Parameters<typeof bulkUpdateDates>[1]
  ) => {
    await bulkUpdateDates(ids, options)
    setSelectedIds([])
  }, [bulkUpdateDates])

  const handleBulkUpdateTVShowDetails = useCallback(async (ids: string[]) => {
    await bulkUpdateTVShowDetails(ids)
    setSelectedIds([])
  }, [bulkUpdateTVShowDetails])

  const handleUpdateItem = async (id: string, data: Partial<WatchedItem>) => {
    await updateItem(id, data)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

  const isLoading = isBulkUpdatingStatus || isBulkDeleting || isBulkUpdatingRating || isBulkUpdatingDates || isBulkUpdatingTVShowDetails

  return (
    <div className="space-y-8">
      {/* TV Shows Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Shows"
          value={tvWatchlistItems.length}
          description="TV shows in your collection"
          icon={Tv}
          isLoading={itemsLoading}
        />
        <StatsCard
          title="Completed"
          value={tvWatchlistItems.filter(item => item.status === 'COMPLETED').length}
          description="Shows finished"
          icon={Tv}
          isLoading={itemsLoading}
        />
        <StatsCard
          title="Watching"
          value={tvWatchlistItems.filter(item => item.status === 'WATCHING').length}
          description="Currently watching"
          icon={Tv}
          isLoading={itemsLoading}
        />
        <StatsCard
          title="Planned"
          value={tvWatchlistItems.filter(item => item.status === 'PLANNED').length}
          description="Want to watch"
          icon={Tv}
          isLoading={itemsLoading}
        />
      </div>

      {/* TV Show Collection */}
      <div>
        <SectionHeader title="Your TV Show Collection">
          <div className="flex items-center gap-2">
            {tvWatchlistItems.length > 0 && (
              <Button
                variant={showBulkMode ? "default" : "outline"}
                size="sm"
                onClick={toggleBulkMode}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {showBulkMode ? "Exit Select" : "Select"}
              </Button>
            )}
            <Button variant="outline" onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add More Shows
            </Button>
          </div>
        </SectionHeader>

        {itemsLoading ? (
          <LoadingGrid count={6} className="grid gap-4 md:grid-cols-1 lg:grid-cols-2" />
        ) : tvWatchlistItems.length === 0 ? (
          <EmptyState
            icon={Tv}
            title="No TV shows yet"
            description="Start building your TV show collection by adding your first series"
          >
            <Button onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First TV Show
            </Button>
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            <LibraryBulkActionsBar
              selectedIds={selectedIds}
              totalItems={tvWatchlistItems.length}
              mediaType="TV"
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
              onBulkUpdateRating={handleBulkUpdateRating}
              onBulkUpdateDates={handleBulkUpdateDates}
              onBulkUpdateTVShowDetails={handleBulkUpdateTVShowDetails}
              isLoading={isLoading}
            />

            {/* TV Show Grid */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {tvWatchlistItems.map(item => (
                <TVShowCard
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  showSeasonProgress={true}
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