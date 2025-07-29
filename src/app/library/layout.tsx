'use client'
import { useEffect } from 'react'
import { Library } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader } from '@/components/common/page-header'
import { AddMediaModal } from '@/components/common/add-media-modal'
import { api } from '@/trpc/react'
import { useMedia } from '@/hooks/use-media'
import { useUI } from '@/hooks/use-ui'
import {
  calculateProgress,
  calculateProgressFromWatchedItem,
} from '@/lib/utils'
import type { TMDBMediaItem, WatchedItem } from '@/types'

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    stats,
    setStats,
    setWatchedItems,
    setItemsLoading,
    setStatsLoading,
    addMedia,
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
          progress:
            item.mediaType === 'MOVIE'
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

  const handleAddMedia = async (media: TMDBMediaItem) => {
    await addMedia(media)
    closeSearchModal()
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
        {children}
      </div>
    </DashboardLayout>
  )
}
