'use client'

import { Plus, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TVShowCard } from '@/components/features/tv/tv-show-card'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import type { WatchedItem } from '@/types'

export default function TVShowsPage() {
  const { watchedItems, itemsLoading, updateItem, deleteItem } = useMedia()
  const { openSearchModal } = useUI()

  // Filter items by media type
  const tvWatchlistItems = watchedItems.filter(item => item.mediaType === 'TV')

  const handleUpdateItem = async (id: string, data: Partial<WatchedItem>) => {
    await updateItem(id, data)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

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
          <Button variant="outline" onClick={openSearchModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add More Shows
          </Button>
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
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {tvWatchlistItems.map(item => (
              <TVShowCard
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                showSeasonProgress={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}