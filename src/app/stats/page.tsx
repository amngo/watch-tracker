'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  Film,
  Tv,
  Star,
  Eye,
  Target,
  Award,
  Activity,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LoadingCard } from '@/components/common/loading-spinner'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'
import type { ChartConfig } from '@/components/ui/chart'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

const timeRangeLabels: Record<TimeRange, string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  all: 'All Time',
}

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
  }, [])

  const isLoading =
    overviewLoading || activityLoading || achievementsLoading || genresLoading

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Statistics</h1>
                <p className="text-muted-foreground mt-1">
                  Your viewing insights and analytics
                </p>
              </div>
            </div>
          </div>

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Statistics</h1>
              <p className="text-muted-foreground mt-1">
                Your viewing insights and analytics
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
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
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Watch Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {watchTimeData.hours}h {watchTimeData.minutes}m
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated for {timeRangeLabels[timeRange].toLowerCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewData?.overview.completionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of total items watched
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewData?.engagement.averageRating || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                From {overviewData?.engagement.itemsWithRatings || 0} rated
                items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Streak
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">
                Current watching streak
              </p>
            </CardContent>
          </Card>
        </div>

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
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Viewing Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={overviewChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={statusDistributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Content Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="h-5 w-5" />
                    Movies vs TV Shows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={contentTypeChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={contentTypeData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                      >
                        {contentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/2 [&>*]:justify-center"
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Genres Chart */}
            {genresData && genresData.genres.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Most Watched Genres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={genresData.genres.reduce(
                      (acc, genre) => ({
                        ...acc,
                        [genre.name.toLowerCase()]: {
                          label: genre.name,
                          color: genre.color,
                        },
                      }),
                      {} as ChartConfig
                    )}
                    className="h-[300px] w-full"
                  >
                    <BarChart data={genresData.genres}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        fill="var(--chart-1)"
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Detailed Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4" />
                      <span>Movies</span>
                    </div>
                    <Badge variant="outline">
                      {overviewData?.content.movies || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4" />
                      <span>TV Shows</span>
                    </div>
                    <Badge variant="outline">
                      {overviewData?.content.tvShows || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Notes</span>
                    <Badge variant="outline">
                      {overviewData?.engagement.totalNotes || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rated Items</span>
                    <Badge variant="outline">
                      {overviewData?.engagement.itemsWithRatings || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Episodes Watched</span>
                    <Badge variant="outline">
                      {watchTimeData.episodesWatched}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{overviewData?.overview.completionRate || 0}%</span>
                    </div>
                    <Progress
                      value={overviewData?.overview.completionRate || 0}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Viewing Activity Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={activityChartConfig}
                  className="h-[300px]"
                >
                  <AreaChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={value => {
                        const date = new Date(value)
                        return timeRange === 'week'
                          ? date.getDate().toString()
                          : date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                      }}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="1"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Viewing Pattern Heatmap
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your viewing activity by day of week and time of day
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-8 gap-1 text-xs">
                    <div></div>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      day => (
                        <div key={day} className="text-center p-1 font-medium">
                          {day}
                        </div>
                      )
                    )}

                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="contents">
                        <div className="text-right p-1 text-muted-foreground">
                          {hour.toString().padStart(2, '0')}
                        </div>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                          (day, dayIndex) => {
                            const activity =
                              heatmapData.find(
                                d => d.day === day && d.hour === hour
                              )?.activity || 0

                            return (
                              <div
                                key={`${day}-${hour}`}
                                className={cn(
                                  'aspect-square rounded-sm border border-border',
                                  activity === 0 && 'bg-muted/20',
                                  activity === 1 && 'bg-primary/20',
                                  activity === 2 && 'bg-primary/40',
                                  activity === 3 && 'bg-primary/60',
                                  activity >= 4 && 'bg-primary/80'
                                )}
                                title={`${day} ${hour}:00 - Activity: ${activity}`}
                              />
                            )
                          }
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-sm bg-muted/20" />
                      <div className="w-3 h-3 rounded-sm bg-primary/20" />
                      <div className="w-3 h-3 rounded-sm bg-primary/40" />
                      <div className="w-3 h-3 rounded-sm bg-primary/60" />
                      <div className="w-3 h-3 rounded-sm bg-primary/80" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            <div className="grid gap-6 md:grid-cols-2">
              {/* Unlocked Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievementsData?.achievements.length ? (
                    achievementsData.achievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 rounded-lg border"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        <Badge variant="secondary">Unlocked</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Achievements Yet
                      </h3>
                      <p className="text-muted-foreground">
                        Start watching to unlock your first achievement!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Next Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievementsData?.nextMilestones.map((milestone, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{milestone.title}</span>
                        <span className="text-muted-foreground">
                          {milestone.current}/{milestone.target}
                        </span>
                      </div>
                      <Progress
                        value={(milestone.current / milestone.target) * 100}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Achievement Categories */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Film className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Movie Buff</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete movie milestones
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Tv className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Series Veteran</h4>
                  <p className="text-sm text-muted-foreground">
                    Finish TV show seasons
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Time Master</h4>
                  <p className="text-sm text-muted-foreground">
                    Reach watch time goals
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h4 className="font-semibold">Critic</h4>
                  <p className="text-sm text-muted-foreground">
                    Rate and review content
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
