'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ViewingHeatmap } from '@/components/features/stats/viewing-heatmap'
import { api } from '@/trpc/react'
import { formatRuntime } from '@/lib/format'
import type { TimeRange } from '@/types'

export default function PatternsPage() {
  const [timeRange] = useState<TimeRange>('month')

  // Activity data can be used for additional analytics in the future
  const { data: _activityData } = api.stats.activity.useQuery({
    timeRange,
    groupBy:
      timeRange === 'week' ? 'day' : timeRange === 'month' ? 'day' : 'month',
  })

  const { data: overviewData } = api.stats.overview.useQuery({
    timeRange,
  })

  const { data: patternsData } = api.stats.viewingPatterns.useQuery({
    timeRange,
  })

  // Use real viewing patterns data
  const heatmapData = useMemo(() => {
    if (!patternsData?.heatmapData) return []
    return patternsData.heatmapData
  }, [patternsData])

  return (
    <div className="space-y-6">
      <ViewingHeatmap data={heatmapData} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Viewing Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Peak Viewing Time</span>
              <Badge>{patternsData?.stats.peakHour || 'N/A'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Favorite Day</span>
              <Badge>{patternsData?.stats.peakDay || 'N/A'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Binge Sessions</span>
              <Badge>{patternsData?.stats.bingeSessions || 0} this {timeRange}</Badge>
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
              <Badge>{formatRuntime(patternsData?.stats.avgEpisodeLength || 45)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg Movie Length</span>
              <Badge>{formatRuntime(patternsData?.stats.avgMovieLength || 120)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Completion Rate</span>
              <Badge>{overviewData?.overview.completionRate || 0}%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}