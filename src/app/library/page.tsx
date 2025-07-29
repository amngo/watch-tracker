'use client'

import { useEffect } from 'react'
import { Plus, Film, Tv, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { WatchedItemCard } from '@/components/features/media/watched-item-card'
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
import { calculateProgress, calculateProgressFromWatchedItem } from '@/lib/utils'
import type { TMDBMediaItem, WatchedItem } from '@/types'

export default function LibraryPage() {
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

  // Fetch all media items (both movies and TV shows)
  const { data: allItems, isLoading: itemsDataLoading } =
    api.watchedItem.getAll.useQuery({
      limit: 100, // Maximum allowed limit
    })

  // Sync fetched data with Zustand stores
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  useEffect(() => {
    if (allItems?.items) {
      setWatchedItems(
        allItems.items.map(item => ({
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
          progress: item.mediaType === 'MOVIE' 
            ? calculateProgress(
                item.status,
                item.currentEpisode,
                item.totalEpisodes,
                item.currentRuntime,
                item.totalRuntime
              )
            : calculateProgressFromWatchedItem(
                {
                  ...item,
                  watchedEpisodes: item.watchedEpisodes || [],
                  progress: 0,
                } as WatchedItem,
                item.totalSeasons ?? undefined,
                item.totalEpisodes ?? undefined
              ),
        }))
      )
    }
    setItemsLoading(itemsDataLoading)
  }, [allItems, itemsDataLoading, setWatchedItems, setItemsLoading])

  // Filter items by media type
  const movieWatchlistItems = watchedItems.filter(
    item => item.mediaType === 'MOVIE'
  )
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
          icon={Library}
          title="Library"
          subtitle="Your complete media collection"
        >
          <AddMediaModal
            isOpen={isSearchModalOpen}
            onOpenChange={open =>
              open ? openSearchModal() : closeSearchModal()
            }
            onAddMedia={handleAddMedia}
            triggerLabel="Add Media"
            dialogTitle="Search & Add Movies or TV Shows"
          />
        </PageHeader>

        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Movies ({movieWatchlistItems.length})
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              TV Shows ({tvWatchlistItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="space-y-8">
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
          </TabsContent>

          <TabsContent value="tv" className="space-y-8">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}