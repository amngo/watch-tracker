'use client'

import { useEffect, useState } from 'react'
import { Plus, TrendingUp, Clock, CheckCircle, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MediaSearch } from '@/components/features/search/media-search'
import { WatchedItemCard } from '@/components/features/media/watched-item-card'
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
import { useBackgroundUpdates } from '@/hooks/use-background-updates'
import { calculateProgress } from '@/lib/utils'
import type { TMDBMediaItem, WatchedItem } from '@/types'

export default function Dashboard() {
  const {
    watchedItems,
    stats,
    itemsLoading,
    statsLoading,
    addMedia,
    updateItem,
    deleteItem,
    setStats,
    setWatchedItems,
    setItemsLoading,
    setStatsLoading,
  } = useMedia()

  const { isSearchModalOpen, openSearchModal, closeSearchModal } = useUI()
  const { forceUpdate } = useBackgroundUpdates()
  const [isUpdatingTVShows, setIsUpdatingTVShows] = useState(false)

  // Fetch user stats and sync with store
  const { data: statsData, isLoading: statsDataLoading } =
    api.user.getStats.useQuery()

  // Fetch recent watched items and sync with store
  const { data: recentItems, isLoading: itemsDataLoading } =
    api.watchedItem.getAll.useQuery({
      limit: 6,
    })

  // Sync fetched data with Zustand stores
  useEffect(() => {
    if (statsData) {
      setStats(statsData)
    }
    setStatsLoading(statsDataLoading)
  }, [statsData, statsDataLoading, setStats, setStatsLoading])

  useEffect(() => {
    if (recentItems?.items) {
      setWatchedItems(
        recentItems.items.map(item => ({
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
  }, [recentItems, itemsDataLoading, setWatchedItems, setItemsLoading])

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

  const handleUpdateAllTVShows = async () => {
    try {
      setIsUpdatingTVShows(true)
      await forceUpdate({ forceAll: false }) // Only update missing data by default
    } finally {
      setIsUpdatingTVShows(false)
    }
  }


  return (
    <DashboardLayout stats={stats || undefined}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and discover new content
            </p>
          </div>

          <Dialog
            open={isSearchModalOpen}
            onOpenChange={open => !open && closeSearchModal()}
          >
            <Button onClick={openSearchModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Search & Add Media</DialogTitle>
              </DialogHeader>
              <MediaSearch onAddMedia={handleAddMedia} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalItems || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Movies and TV shows tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Currently Watching
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.currentlyWatching || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active watch progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.completedItems || 0}
              </div>
              <p className="text-xs text-muted-foreground">Finished watching</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notes</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalNotes || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Thoughts and reactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleUpdateAllTVShows}
                disabled={isUpdatingTVShows}
              >
                {isUpdatingTVShows ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isUpdatingTVShows ? 'Updating...' : 'Update TV Show Details'}
              </Button>
              <Button variant="outline" onClick={openSearchModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
            </div>
          </div>

          {itemsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : watchedItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first movie or TV show
                  </p>
                  <Button onClick={openSearchModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {watchedItems.slice(0, 6).map(item => (
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
