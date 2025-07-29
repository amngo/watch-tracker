'use client'

import { Plus, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WatchedItemCard } from '@/components/features/media/watched-item-card'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import type { WatchedItem } from '@/types'

export default function MoviesPage() {
  const { watchedItems, itemsLoading, updateItem, deleteItem } = useMedia()
  const { openSearchModal } = useUI()

  // Filter items by media type
  const movieWatchlistItems = watchedItems.filter(
    item => item.mediaType === 'MOVIE'
  )

  const handleUpdateItem = async (id: string, data: Partial<WatchedItem>) => {
    await updateItem(id, data)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

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
            movieWatchlistItems.filter(item => item.status === 'PLANNED')
              .length
          }
          description="Want to watch"
          icon={Film}
          isLoading={itemsLoading}
        />
      </div>

      {/* Movie Collection */}
      <div>
        <SectionHeader title="Your Movie Collection">
          <Button variant="outline" onClick={openSearchModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add More Movies
          </Button>
        </SectionHeader>

        {itemsLoading ? (
          <LoadingGrid
            count={8}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {movieWatchlistItems.map(item => (
              <WatchedItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}