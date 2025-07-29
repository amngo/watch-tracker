'use client'

import { useState, useMemo } from 'react'
import { StatusDistributionChart } from '@/components/features/stats/status-distribution-chart'
import { ContentTypeChart } from '@/components/features/stats/content-type-chart'
import { GenresChart } from '@/components/features/stats/genres-chart'
import { DetailedStats } from '@/components/features/stats/detailed-stats'
import { api } from '@/trpc/react'
import type { ChartConfig } from '@/components/ui/chart'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

// Chart configurations
const overviewChartConfig = {
  completed: {
    label: 'Completed',
    color: 'var(--chart-1)',
  },
  watching: {
    label: 'Currently Watching',
    color: 'var(--chart-2)',
  },
  planned: {
    label: 'Planned',
    color: 'var(--chart-3)',
  },
  paused: {
    label: 'Paused',
    color: 'var(--chart-4)',
  },
  dropped: {
    label: 'Dropped',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

const contentTypeChartConfig = {
  movies: {
    label: 'Movies',
    color: 'var(--chart-1)',
  },
  tvShows: {
    label: 'TV Shows',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export default function OverviewPage() {
  const [timeRange] = useState<TimeRange>('month')

  // Fetch statistics data
  const { data: overviewData } = api.stats.overview.useQuery({
    timeRange,
  })

  const { data: genresData } = api.stats.genres.useQuery({
    timeRange,
    mediaType: 'ALL',
    limit: 8,
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

  // Prepare chart data
  const statusDistributionData = useMemo(() => {
    if (!overviewData) return []

    const { overview } = overviewData
    return [
      {
        name: 'Completed',
        value: overview.completedItems,
        color: 'var(--chart-1)',
      },
      {
        name: 'Watching',
        value: overview.currentlyWatching,
        color: 'var(--chart-2)',
      },
      {
        name: 'Planned',
        value: overview.plannedItems,
        color: 'var(--chart-3)',
      },
      {
        name: 'Paused',
        value: overview.pausedItems,
        color: 'var(--chart-4)',
      },
      {
        name: 'Dropped',
        value: overview.droppedItems,
        color: 'var(--chart-5)',
      },
    ].filter(item => item.value > 0)
  }, [overviewData])

  const contentTypeData = useMemo(() => {
    if (!overviewData) return []

    const { content } = overviewData
    return [
      { name: 'Movies', value: content.movies, color: 'var(--chart-1)' },
      {
        name: 'TV Shows',
        value: content.tvShows,
        color: 'var(--chart-2)',
      },
    ].filter(item => item.value > 0)
  }, [overviewData])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <StatusDistributionChart
          data={statusDistributionData}
          config={overviewChartConfig}
        />
        
        <ContentTypeChart
          data={contentTypeData}
          config={contentTypeChartConfig}
        />
      </div>

      <GenresChart data={genresData?.genres || []} />

      <DetailedStats
        movies={overviewData?.content.movies || 0}
        tvShows={overviewData?.content.tvShows || 0}
        totalNotes={overviewData?.engagement.totalNotes || 0}
        itemsWithRatings={overviewData?.engagement.itemsWithRatings || 0}
        episodesWatched={watchTimeData.episodesWatched}
        completionRate={overviewData?.overview.completionRate || 0}
      />
    </div>
  )
}