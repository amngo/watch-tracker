'use client'

import { useEffect } from 'react'
import { Plus, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { WatchedItemCard } from '@/components/features/media/watched-item-card'
import { PageHeader } from '@/components/common/page-header'
import { AddMediaModal } from '@/components/common/add-media-modal'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { api } from '@/trpc/react'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import { calculateProgress } from '@/lib/utils'
import type { TMDBMediaItem, WatchedItem } from '@/types'

export default function MoviesPage() {
  const {
    watchedItems,
    stats,
    itemsLoading,
    addMedia,
    updateItem,
    deleteItem,
    setStats,
    setWatchedItems,
    setItemsLoading,
    setStatsLoading,
  } = useMedia()

  const { isSearchModalOpen, openSearchModal, closeSearchModal } = useUI()

  // Fetch user stats and sync with store
  const { data: statsData, isLoading: statsDataLoading } =
    api.user.getStats.useQuery()

  // Fetch all movie items and sync with store
  const { data: movieItems, isLoading: itemsDataLoading } =
    api.watchedItem.getAll.useQuery({
      mediaType: 'MOVIE',
      limit: 100,
    })

  // Sync fetched data with Zustand stores
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  useEffect(() => {
    if (movieItems?.items) {
      setWatchedItems(
        movieItems.items.map(item => ({
          id: item.id,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          poster: item.poster,
          releaseDate: item.releaseDate,
          status: item.status,
          rating: item.rating,
          currentEpisode: item.currentEpisode,
          totalEpisodes: item.totalEpisodes,
          currentSeason: item.currentSeason,
          totalSeasons: item.totalSeasons,
          currentRuntime: item.currentRuntime,
          totalRuntime: item.totalRuntime,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          startDate: item.startDate,
          finishDate: item.finishDate,
          notes: item.notes || [],
          _count: item._count,
          progress: calculateProgress(
            item.status,
            item.currentEpisode,
            item.totalEpisodes,
            item.currentRuntime,
            item.totalRuntime
          ),
        }))
      )
    }
    setItemsLoading(itemsDataLoading)
  }, [movieItems, itemsDataLoading, setWatchedItems, setItemsLoading])

  // Filter items by media type (movies only)
  const movieWatchlistItems = watchedItems.filter(item => item.mediaType === 'MOVIE')

  const handleAddMedia = async (media: TMDBMediaItem) => {
    await addMedia(media)
    closeSearchModal()
  }

  const handleUpdateItem = async (id: string, data: Partial<WatchedItem>) => {
    await updateItem(id, data)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id)
  }

  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        <PageHeader
          icon={Film}
          title="Movies"
          subtitle="Your movie watchlist and collection"
        >
          <AddMediaModal
            isOpen={isSearchModalOpen}
            onOpenChange={open => open ? openSearchModal() : closeSearchModal()}
            onAddMedia={handleAddMedia}
            triggerLabel="Add Movie"
            dialogTitle="Search & Add Movies"
          />
        </PageHeader>

        {/* Stats Cards */}
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
            value={movieWatchlistItems.filter(item => item.status === 'COMPLETED').length}
            description="Movies watched"
            icon={Film}
            isLoading={itemsLoading}
          />
          <StatsCard
            title="Watching"
            value={movieWatchlistItems.filter(item => item.status === 'WATCHING').length}
            description="Currently watching"
            icon={Film}
            isLoading={itemsLoading}
          />
          <StatsCard
            title="Planned"
            value={movieWatchlistItems.filter(item => item.status === 'PLANNED').length}
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
            <LoadingGrid count={8} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </DashboardLayout>
  )
}