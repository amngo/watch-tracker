'use client'

import { useState } from 'react'
import { Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { api } from '@/trpc/react'
import { LoadingCard } from '@/components/common/loading-spinner'
import { ErrorDisplay } from '@/components/common/error-boundary'
import { showToast } from '@/components/common/toast-provider'

export default function Dashboard() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = api.user.getStats.useQuery()

  // Fetch recent watched items
  const {
    data: recentItems,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = api.watchedItem.getAll.useQuery({
    limit: 6,
  })

  // Create watched item mutation
  const createWatchedItem = api.watchedItem.create.useMutation({
    onSuccess: () => {
      refetchItems()
      setIsSearchOpen(false)
      showToast.success('Media added successfully!')
    },
    onError: error => {
      showToast.error('Failed to add media', error.message)
    },
  })

  // Update watched item mutation
  const updateWatchedItem = api.watchedItem.update.useMutation({
    onSuccess: () => {
      refetchItems()
      showToast.success('Progress updated!')
    },
    onError: error => {
      showToast.error('Failed to update progress', error.message)
    },
  })

  // Delete watched item mutation
  const deleteWatchedItem = api.watchedItem.delete.useMutation({
    onSuccess: () => {
      refetchItems()
      showToast.success('Item removed')
    },
    onError: error => {
      showToast.error('Failed to remove item', error.message)
    },
  })

  const handleAddMedia = async (media: {
    id: number
    media_type: string
    title?: string
    name?: string
    poster_path?: string
    release_date?: string
    first_air_date?: string
  }) => {
    try {
      const dateString = media.release_date || media.first_air_date
      const releaseDate = dateString ? new Date(dateString) : undefined

      await createWatchedItem.mutateAsync({
        tmdbId: media.id,
        mediaType: media.media_type === 'movie' ? 'MOVIE' : 'TV',
        title: media.title || media.name || 'Unknown Title',
        poster: media.poster_path,
        releaseDate,
        totalRuntime: media.media_type === 'movie' ? 120 : undefined, // Mock runtime
        totalEpisodes: media.media_type === 'tv' ? 24 : undefined, // Mock episode count
        totalSeasons: media.media_type === 'tv' ? 2 : undefined, // Mock season count
      })
    } catch (error) {
      console.error('Error adding media:', error)
    }
  }

  const handleUpdateItem = async (
    id: string,
    data: Record<string, unknown>
  ) => {
    try {
      await updateWatchedItem.mutateAsync({ id, ...data })
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteWatchedItem.mutateAsync({ id })
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <DashboardLayout stats={stats}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and discover new content
            </p>
          </div>

          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Media
              </Button>
            </DialogTrigger>
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
            <Button variant="outline" onClick={() => setIsSearchOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add More
            </Button>
          </div>

          {itemsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : recentItems?.items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first movie or TV show
                  </p>
                  <Button onClick={() => setIsSearchOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentItems?.items.map(item => (
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
