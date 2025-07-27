'use client'

import { useState, useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoadingCard } from '@/components/common/loading-spinner'
import { PageHeader } from '@/components/common/page-header'
import { KeyMetrics } from '@/components/features/stats/key-metrics'
import { StatusDistributionChart } from '@/components/features/stats/status-distribution-chart'
import { ContentTypeChart } from '@/components/features/stats/content-type-chart'
import { GenresChart } from '@/components/features/stats/genres-chart'
import { ActivityChart } from '@/components/features/stats/activity-chart'
import { ViewingHeatmap } from '@/components/features/stats/viewing-heatmap'
import { AchievementsPanel } from '@/components/features/stats/achievements-panel'
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

const activityChartConfig = {
  completed: {
    label: 'Items Completed',
    color: 'var(--chart-1)',
  },
  movies: {
    label: 'Movies',
    color: 'var(--chart-2)',
  },
  tvShows: {
    label: 'TV Shows',
    color: 'var(--chart-3)',
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

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  // Fetch statistics data
  const { data: overviewData, isLoading: overviewLoading } =
    api.stats.overview.useQuery({
      timeRange,
    })

  const { data: activityData, isLoading: activityLoading } =
    api.stats.activity.useQuery({
      timeRange,
      groupBy:
        timeRange === 'week' ? 'day' : timeRange === 'month' ? 'day' : 'month',
    })

  const { data: achievementsData, isLoading: achievementsLoading } =
    api.stats.achievements.useQuery()

  const { data: genresData, isLoading: genresLoading } =
    api.stats.genres.useQuery({
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

  const activityChartData = useMemo(() => {
    if (!activityData) return []

    return activityData.activity.map(item => ({
      date: item.date,
      completed: item.completed,
      movies: item.movies,
      tvShows: item.tvShows,
    }))
  }, [activityData])

  // Generate heatmap data (simplified version)
  const heatmapData = useMemo(() => {
    if (!activityData) return []

    const data = []
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // Generate mock data for demonstration
    // In a real implementation, you'd track actual viewing times
    for (const day of daysOfWeek) {
      for (const hour of hours) {
        const activity = Math.floor(Math.random() * 5) // 0-4 scale
        data.push({
          day,
          hour,
          activity,
          dayIndex: daysOfWeek.indexOf(day),
        })
      }
    }

    return data
  }, [activityData])

  const isLoading =
    overviewLoading || activityLoading || achievementsLoading || genresLoading

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
          icon={BarChart3}
          title="Statistics"
          subtitle="Your viewing insights and analytics"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Period:</span>
            <Tabs
              value={timeRange}
              onValueChange={value => setTimeRange(value as TimeRange)}
            >
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </PageHeader>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
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
        <PageHeader
          icon={BarChart3}
          title="Statistics"
          subtitle="Your viewing insights and analytics"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Period:</span>
            <Tabs
              value={timeRange}
              onValueChange={value => setTimeRange(value as TimeRange)}
            >
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </PageHeader>
        
        <KeyMetrics
          timeRange={timeRange}
          watchTimeData={watchTimeData}
          completionRate={overviewData?.overview.completionRate || 0}
          averageRating={overviewData?.engagement.averageRating || null}
          itemsWithRatings={overviewData?.engagement.itemsWithRatings || 0}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityChart
              data={activityChartData}
              timeRange={timeRange}
              config={activityChartConfig}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Movies vs TV Shows Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={activityChartConfig}
                    className="h-[200px]"
                  >
                    <BarChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={value => {
                          const date = new Date(value)
                          return date.getDate().toString()
                        }}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="movies" fill="var(--chart-2)" />
                      <Bar dataKey="tvShows" fill="var(--chart-3)" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Most Active Day</span>
                    <Badge>Monday</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Items/Week</span>
                    <Badge>
                      {Math.round(
                        (overviewData?.overview.completedItems || 0) / 4
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Best Streak</span>
                    <Badge>12 days</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <ViewingHeatmap data={heatmapData} />

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Viewing Habits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Peak Viewing Time</span>
                    <Badge>8-10 PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Favorite Day</span>
                    <Badge>Saturday</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Binge Sessions</span>
                    <Badge>12 this month</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Avg Episode Length</span>
                    <Badge>45 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Movie Length</span>
                    <Badge>2h 15m</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completion Rate</span>
                    <Badge>{overviewData?.overview.completionRate || 0}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementsPanel
              achievements={achievementsData?.achievements || []}
              nextMilestones={achievementsData?.nextMilestones || []}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
