'use client'

import { useEffect } from 'react'
import { Plus, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MediaSearch } from '@/components/features/search/media-search'
import { TVShowCard } from '@/components/features/tv/tv-show-card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/trpc/react'
import { LoadingCard } from '@/components/common/loading-spinner'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import { calculateProgress } from '@/lib/utils'
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
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Tv className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TV Shows</h1>
              <p className="text-muted-foreground mt-1">
                Your TV show watchlist and collection
              </p>
            </div>
          </div>

          <Dialog
            open={isSearchModalOpen}
            onOpenChange={open => !open && closeSearchModal()}
          >
            <Button onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add TV Show
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Search & Add TV Shows</DialogTitle>
              </DialogHeader>
              <MediaSearch onAddMedia={handleAddMedia} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {itemsLoading ? '...' : tvWatchlistItems.length}
              </div>
              <p className="text-xs text-muted-foreground">
                TV shows in your collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {itemsLoading
                  ? '...'
                  : tvWatchlistItems.filter(item => item.status === 'COMPLETED').length}
              </div>
              <p className="text-xs text-muted-foreground">Shows finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watching</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {itemsLoading
                  ? '...'
                  : tvWatchlistItems.filter(item => item.status === 'WATCHING').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently watching</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planned</CardTitle>
              <Tv className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {itemsLoading
                  ? '...'
                  : tvWatchlistItems.filter(item => item.status === 'PLANNED').length}
              </div>
              <p className="text-xs text-muted-foreground">Want to watch</p>
            </CardContent>
          </Card>
        </div>

        {/* TV Show Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your TV Show Collection</h2>
            <Button variant="outline" onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add More Shows
            </Button>
          </div>

          {itemsLoading ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : tvWatchlistItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <Tv className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No TV shows yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your TV show collection by adding your first series
                  </p>
                  <Button onClick={openSearchModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First TV Show
                  </Button>
                </div>
              </CardContent>
            </Card>
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