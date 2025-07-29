'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ActivityChart } from '@/components/features/stats/activity-chart'
import { api } from '@/trpc/react'
import type { ChartConfig } from '@/components/ui/chart'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

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

export default function ActivityPage() {
  const [timeRange] = useState<TimeRange>('month')

  const { data: activityData } = api.stats.activity.useQuery({
    timeRange,
    groupBy:
      timeRange === 'week' ? 'day' : timeRange === 'month' ? 'day' : 'month',
  })

  const { data: overviewData } = api.stats.overview.useQuery({
    timeRange,
  })

  const activityChartData = useMemo(() => {
    if (!activityData) return []

    return activityData.activity.map(item => ({
      date: item.date,
      completed: item.completed,
      movies: item.movies,
      tvShows: item.tvShows,
    }))
  }, [activityData])

  return (
    <div className="space-y-6">
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
    </div>
  )
}