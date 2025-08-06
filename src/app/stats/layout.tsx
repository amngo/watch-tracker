'use client'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsPageLoading } from '@/components/common/loading-states'
import { StatsHeader } from '@/components/features/stats/stats-header'
import { KeyMetrics } from '@/components/features/stats/key-metrics'
import { useState, useMemo } from 'react'
import { api } from '@/trpc/react'
import type { TimeRange } from '@/types'

// Constants for watch time estimation
const AVERAGE_MOVIE_RUNTIME_MINUTES = 120
const AVERAGE_TV_EPISODE_RUNTIME_MINUTES = 45
const AVERAGE_TV_SEASONS_WATCHED = 2
const AVERAGE_EPISODES_PER_SEASON = 12

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    const movieMinutes = overviewData.content.movies * AVERAGE_MOVIE_RUNTIME_MINUTES
    const tvMinutes =
      overviewData.content.tvShows *
      AVERAGE_TV_EPISODE_RUNTIME_MINUTES *
      AVERAGE_TV_SEASONS_WATCHED *
      AVERAGE_EPISODES_PER_SEASON

    const totalMinutes = movieMinutes + tvMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return {
      hours,
      minutes,
      episodesWatched:
        overviewData.content.tvShows *
        AVERAGE_TV_SEASONS_WATCHED *
        AVERAGE_EPISODES_PER_SEASON,
    }
  }, [overviewData])

  // Tab navigation handled by individual pages

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
