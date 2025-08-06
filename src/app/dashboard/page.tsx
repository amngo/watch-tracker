'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { WatchedItemCard } from '@/components/features/media/watched-item-card'
import { AddMediaModal } from '@/components/common/add-media-modal'
import { StatsCard } from '@/components/common/stats-card'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingGrid } from '@/components/common/loading-grid'
import { SectionHeader } from '@/components/common/section-header'
import { api } from '@/trpc/react'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import { useBackgroundUpdates } from '@/hooks/use-background-updates'
import { calculateProgress } from '@/lib/utils'
import type { WatchedItem } from '@/types'
import { TVShowCard } from '@/components/features/tv/tv-show-card'
import { MovieWithMediaType, TVWithMediaType } from 'tmdb-ts'

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

  const handleAddMedia = async (
    media: TVWithMediaType | MovieWithMediaType
  ) => {
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

          <AddMediaModal
            isOpen={isSearchModalOpen}
            onOpenChange={open =>
              open ? openSearchModal() : closeSearchModal()
            }
            onAddMedia={handleAddMedia}
            triggerLabel="Add Media"
            dialogTitle="Search & Add Media"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Items"
            value={stats?.totalItems || 0}
            description="Movies and TV shows tracked"
            icon={TrendingUp}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Currently Watching"
            value={stats?.currentlyWatching || 0}
            description="Active watch progress"
            icon={Clock}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Completed"
            value={stats?.completedItems || 0}
            description="Finished watching"
            icon={CheckCircle}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Notes"
            value={stats?.totalNotes || 0}
            description="Thoughts and reactions"
            icon={Plus}
            isLoading={statsLoading}
          />
        </div>

        {/* Recent Activity */}
        <div>
          <SectionHeader title="Recent Activity">
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
          </SectionHeader>

          {itemsLoading ? (
            <LoadingGrid />
          ) : watchedItems.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No items yet"
              description="Start by adding your first movie or TV show"
            >
              <Button onClick={openSearchModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </EmptyState>
          ) : (
            <div className="grid gap-4">
              {watchedItems
                .slice(0, 10)
                .map(item =>
                  item.mediaType === 'TV' ? (
                    <TVShowCard
                      key={item.id}
                      item={item}
                      onUpdate={handleUpdateItem}
                      onDelete={handleDeleteItem}
                    />
                  ) : (
                    <WatchedItemCard
                      key={item.id}
                      item={item}
                      onUpdate={handleUpdateItem}
                      onDelete={handleDeleteItem}
                    />
                  )
                )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
