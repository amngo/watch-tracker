'use client'

import { useEffect } from 'react'
import { Plus, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TVShowCard } from '@/components/features/tv/tv-show-card'
import { PageHeader } from '@/components/common/page-header'
import { AddMediaModal } from '@/components/common/add-media-modal'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { api } from '@/trpc/react'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import { calculateProgressFromWatchedItem } from '@/lib/utils'
import type { TMDBMediaItem, WatchedItem } from '@/types'

export default function TVPage() {
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

  // Fetch all TV show items and sync with store
  const { data: tvItems, isLoading: itemsDataLoading } =
    api.watchedItem.getAll.useQuery({
      mediaType: 'TV',
      limit: 100,
    })

  console.log('TV items fetched:', tvItems)

  // Sync fetched data with Zustand stores
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  useEffect(() => {
    if (tvItems?.items) {
      setWatchedItems(
        tvItems.items.map(item => ({
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
          watchedEpisodes: item.watchedEpisodes || [],
          progress: calculateProgressFromWatchedItem(
            {
              ...item,
              watchedEpisodes: item.watchedEpisodes || [],
              progress: 0, // Temporary placeholder, will be calculated
            } as WatchedItem,
            item.totalSeasons ?? undefined,
            item.totalEpisodes ?? undefined
          ),
        }))
      )
    }
    setItemsLoading(itemsDataLoading)
  }, [tvItems, itemsDataLoading, setWatchedItems, setItemsLoading])

  // Filter items by media type (TV shows only)
  const tvWatchlistItems = watchedItems.filter(item => item.mediaType === 'TV')

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
          icon={Tv}
          title="TV Shows"
          subtitle="Your TV show watchlist and collection"
        >
          <AddMediaModal
            isOpen={isSearchModalOpen}
            onOpenChange={open => open ? openSearchModal() : closeSearchModal()}
            onAddMedia={handleAddMedia}
            triggerLabel="Add TV Show"
            dialogTitle="Search & Add TV Shows"
          />
        </PageHeader>

        {/* Stats Cards */}
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
    </DashboardLayout>
  )
}
