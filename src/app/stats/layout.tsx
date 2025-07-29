'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsPageLoading } from '@/components/common/loading-states'
import { StatsHeader } from '@/components/features/stats/stats-header'
import { KeyMetrics } from '@/components/features/stats/key-metrics'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { api } from '@/trpc/react'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  // Fetch statistics data for shared components
  const { data: overviewData, isLoading: overviewLoading } =
    api.stats.overview.useQuery({
      timeRange,
    })

  // Use actual watch time from API or calculate estimate
  const watchTimeData = useMemo(() => {
    if (!overviewData) return { hours: 0, minutes: 0, episodesWatched: 0 }

    // Use API data if available, otherwise calculate estimate
    if (overviewData.watchTime) {
      return {
        hours: Math.floor(overviewData.watchTime.totalHours),
        minutes: Math.round((overviewData.watchTime.totalHours % 1) * 60),
        episodesWatched: overviewData.watchTime.episodesWatched,
      }
    }

    // Fallback to estimate for demo
    const avgMovieRuntime = 120
    const avgTVEpisodeRuntime = 45
    const avgTVSeasonsWatched = 2
    const avgEpisodesPerSeason = 12

    const movieMinutes = overviewData.content.movies * avgMovieRuntime
    const tvMinutes =
      overviewData.content.tvShows *
      avgTVEpisodeRuntime *
      avgTVSeasonsWatched *
      avgEpisodesPerSeason

    const totalMinutes = movieMinutes + tvMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return {
      hours,
      minutes,
      episodesWatched:
        overviewData.content.tvShows *
        avgTVSeasonsWatched *
        avgEpisodesPerSeason,
    }
  }, [overviewData])

  // Determine current tab from pathname
  const currentTab = pathname.split('/').pop() || 'overview'

  const handleTabChange = (value: string) => {
    router.push(`/stats/${value}`)
  }

  if (overviewLoading) {
    return (
      <DashboardLayout>
        <StatsPageLoading />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      stats={
        overviewData
          ? {
              totalItems: overviewData.overview.totalItems,
              currentlyWatching: overviewData.overview.currentlyWatching,
              completedItems: overviewData.overview.completedItems,
              totalNotes: overviewData.engagement.totalNotes,
            }
          : undefined
      }
    >
      <div className="space-y-6">
        <StatsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        <KeyMetrics
          timeRange={timeRange}
          watchTimeData={watchTimeData}
          completionRate={overviewData?.overview.completionRate || 0}
          averageRating={overviewData?.engagement.averageRating || null}
          itemsWithRatings={overviewData?.engagement.itemsWithRatings || 0}
        />

        {children}
      </div>
    </DashboardLayout>
  )
}
